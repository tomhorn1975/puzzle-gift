import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import type { MultipleChoicePuzzleConfig, MathPuzzleConfig } from '@/lib/types'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json().catch(() => null)

  if (!body?.answers || typeof body.answers !== 'object') {
    return NextResponse.json({ success: false, message: 'Invalid request.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: gift, error } = await supabase
    .from('gifts')
    .select('id, content_type, file_path, text_content, puzzle_type, puzzle_config, is_active, expires_at, max_attempts')
    .eq('id', id)
    .single()

  if (error || !gift) {
    return NextResponse.json({ success: false, message: 'Gift not found.' }, { status: 404 })
  }

  if (!gift.is_active) {
    return NextResponse.json({ success: false, message: 'This gift is no longer active.' }, { status: 410 })
  }

  if (gift.expires_at && new Date(gift.expires_at) < new Date()) {
    return NextResponse.json({ success: false, message: 'This gift has expired.' }, { status: 410 })
  }

  // Verify answers server-side — answers never reach the client
  const answers = body.answers as Record<string, number>
  let isCorrect = false

  if (gift.puzzle_type === 'multiple_choice') {
    const config = gift.puzzle_config as MultipleChoicePuzzleConfig
    isCorrect = config.questions.every(q => answers[q.id] === q.answer_index)
  } else if (gift.puzzle_type === 'math') {
    const config = gift.puzzle_config as MathPuzzleConfig
    isCorrect = config.problems.every(p => Number(answers[p.id]) === p.answer)
  }

  if (!isCorrect) {
    return NextResponse.json({ success: false, message: 'Wrong answers — try again!' })
  }

  // Record the solve
  await supabase.from('gift_access').insert({
    gift_id: gift.id,
    ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] ?? null,
  })

  // Return content
  if (gift.content_type === 'text') {
    return NextResponse.json({ success: true, content: { type: 'text', value: gift.text_content } })
  }

  // Generate a 2-hour signed URL for private storage
  const { data: signed } = await supabase.storage
    .from('gift-content')
    .createSignedUrl(gift.file_path!, 60 * 60 * 2)

  if (!signed?.signedUrl) {
    return NextResponse.json({ success: false, message: 'Could not retrieve gift content.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, content: { type: 'url', url: signed.signedUrl } })
}
