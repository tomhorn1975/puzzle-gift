import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import type { TriviaConfig, MathConfig, SlideConfig, JigsawConfig } from '@/lib/types'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ success: false, message: 'Invalid request.' }, { status: 400 })

  const supabase = createAdminClient()

  const { data: gift, error } = await supabase
    .from('gifts')
    .select('id, content_type, file_path, text_content, puzzle_type, puzzle_config, personal_message, is_active, expires_at')
    .eq('id', id)
    .single()

  if (error || !gift) return NextResponse.json({ success: false, message: 'Gift not found.' }, { status: 404 })
  if (!gift.is_active)  return NextResponse.json({ success: false, message: 'This gift is no longer active.' }, { status: 410 })
  if (gift.expires_at && new Date(gift.expires_at) < new Date()) {
    return NextResponse.json({ success: false, message: 'This gift has expired.' }, { status: 410 })
  }

  let isCorrect = false

  if (gift.puzzle_type === 'trivia') {
    const config  = gift.puzzle_config as unknown as TriviaConfig
    const answers = body.answers as Record<string, number>
    if (!answers) return NextResponse.json({ success: false, message: 'Invalid request.' }, { status: 400 })
    isCorrect = config.questions.every(q => answers[q.id] === q.answer_index)

  } else if (gift.puzzle_type === 'math') {
    const config  = gift.puzzle_config as unknown as MathConfig
    const answers = body.answers as Record<string, number>
    if (!answers) return NextResponse.json({ success: false, message: 'Invalid request.' }, { status: 400 })
    isCorrect = config.problems.every(p => Number(answers[p.id]) === p.answer)

  } else if (gift.puzzle_type === 'slide' || gift.puzzle_type === 'jigsaw') {
    // Client-side solve — trust the flag; the puzzle component only calls this after genuine completion
    isCorrect = body.solved === true
  }

  if (!isCorrect) {
    return NextResponse.json({ success: false, message: 'Wrong answers — try again!' })
  }

  // Record the solve
  await supabase.from('gift_access').insert({
    gift_id: gift.id,
    ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] ?? null,
  })

  // ── Return content ──────────────────────────────────────────────────────────
  if (gift.puzzle_type === 'slide' || gift.puzzle_type === 'jigsaw') {
    const config = gift.puzzle_config as unknown as SlideConfig | JigsawConfig
    return NextResponse.json({
      success: true,
      content: { type: 'assembled', image_url: config.image_url, message: gift.personal_message },
    })
  }

  if (gift.content_type === 'text') {
    return NextResponse.json({ success: true, content: { type: 'text', value: gift.text_content } })
  }

  const { data: signed } = await supabase.storage
    .from('gift-content')
    .createSignedUrl(gift.file_path!, 60 * 60 * 2)

  if (!signed?.signedUrl) {
    return NextResponse.json({ success: false, message: 'Could not retrieve gift content.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, content: { type: 'url', url: signed.signedUrl } })
}
