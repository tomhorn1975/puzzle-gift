import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { sendGiftSolvedEmail } from '@/lib/email'
import type { TriviaConfig, MathConfig, SlideConfig, JigsawConfig, WordScrambleConfig, RiddleConfig } from '@/lib/types'

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
    .select('id, title, content_type, file_path, text_content, puzzle_type, puzzle_config, personal_message, is_active, expires_at, notification_email, gift_card_brand_name, gift_card_amount_cents, gift_card_code, amazon_product_url, amazon_product_title, amazon_product_image, amazon_prize_amount_cents')
    .eq('id', id)
    .single()

  const g = gift as typeof gift & {
    amazon_product_url?: string | null
    amazon_product_title?: string | null
    amazon_product_image?: string | null
    amazon_prize_amount_cents?: number | null
  }

  if (error || !g) return NextResponse.json({ success: false, message: 'Gift not found.' }, { status: 404 })
  if (!g.is_active)  return NextResponse.json({ success: false, message: 'This gift is no longer active.' }, { status: 410 })
  if (g.expires_at && new Date(g.expires_at) < new Date()) {
    return NextResponse.json({ success: false, message: 'This gift has expired.' }, { status: 410 })
  }

  let isCorrect = false

  if (g.puzzle_type === 'trivia') {
    const config  = g.puzzle_config as unknown as TriviaConfig
    const answers = body.answers as Record<string, number>
    if (!answers) return NextResponse.json({ success: false, message: 'Invalid request.' }, { status: 400 })
    isCorrect = config.questions.every(q => answers[q.id] === q.answer_index)

  } else if (g.puzzle_type === 'math') {
    const config  = g.puzzle_config as unknown as MathConfig
    const answers = body.answers as Record<string, number>
    if (!answers) return NextResponse.json({ success: false, message: 'Invalid request.' }, { status: 400 })
    isCorrect = config.problems.every(p => Number(answers[p.id]) === p.answer)

  } else if (g.puzzle_type === 'slide' || g.puzzle_type === 'jigsaw') {
    isCorrect = body.solved === true

  } else if (g.puzzle_type === 'word_scramble') {
    const config = g.puzzle_config as unknown as WordScrambleConfig
    const userAnswer = String(body.answer ?? '').trim().toLowerCase().replace(/\s+/g, '')
    const correct = config.word.trim().toLowerCase().replace(/\s+/g, '')
    isCorrect = userAnswer === correct

  } else if (g.puzzle_type === 'riddle') {
    const config = g.puzzle_config as unknown as RiddleConfig
    const userAnswer = String(body.answer ?? '').trim().toLowerCase()
    const correct = config.answer.trim().toLowerCase()
    isCorrect = userAnswer === correct
  }

  if (!isCorrect) {
    return NextResponse.json({ success: false, message: 'Wrong answer — try again!' })
  }

  void supabase.from('gift_access').insert({
    gift_id: g.id,
    ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] ?? null,
  })

  if (g.notification_email) {
    sendGiftSolvedEmail({
      to: g.notification_email!,
      giftTitle: g.title,
      puzzleType: g.puzzle_type ?? 'unknown',
    }).catch(err => console.error('Failed to send solved notification:', err))
  }

  // ── Return content ──────────────────────────────────────────────────────────
  if (g.puzzle_type === 'slide' || g.puzzle_type === 'jigsaw') {
    const config = g.puzzle_config as unknown as SlideConfig | JigsawConfig
    return NextResponse.json({
      success: true,
      content: { type: 'assembled', image_url: config.image_url, message: g.personal_message },
    })
  }

  if (g.content_type === 'amazon_prize') {
    return NextResponse.json({
      success: true,
      content: {
        type: 'amazon_prize',
        gift_id: g.id,
        product_title: g.amazon_product_title,
        product_image: g.amazon_product_image,
        prize_amount_cents: g.amazon_prize_amount_cents,
      },
    })
  }

  if (g.content_type === 'gift_card') {
    return NextResponse.json({
      success: true,
      content: {
        type: 'gift_card',
        brand_name: g.gift_card_brand_name,
        amount_cents: g.gift_card_amount_cents,
        claim_link: g.gift_card_code,
      },
    })
  }

  if (g.content_type === 'text') {
    return NextResponse.json({ success: true, content: { type: 'text', value: g.text_content } })
  }

  const { data: signed } = await supabase.storage
    .from('gift-content')
    .createSignedUrl(g.file_path!, 60 * 60 * 2)

  if (!signed?.signedUrl) {
    return NextResponse.json({ success: false, message: 'Could not retrieve gift content.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, content: { type: 'url', url: signed.signedUrl } })
}
