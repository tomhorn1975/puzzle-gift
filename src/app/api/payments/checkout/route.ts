import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe, PUZZLE_FEE_CENTS, GIFT_CARD_SERVICE_FEE_CENTS } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.gift_id) return NextResponse.json({ error: 'Missing gift_id' }, { status: 400 })

  const admin = createAdminClient()
  const { data: gift } = await admin
    .from('gifts')
    .select('id, title, content_type, gift_card_amount_cents, gift_card_brand_name, payment_status')
    .eq('id', body.gift_id)
    .eq('sender_id', user.id)
    .single()

  if (!gift) return NextResponse.json({ error: 'Gift not found' }, { status: 404 })
  if (gift.payment_status !== 'pending') return NextResponse.json({ error: 'Gift already processed' }, { status: 409 })

  const isGiftCard = gift.content_type === 'gift_card'
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  type LineItem = {
    price_data: {
      currency: string
      product_data: { name: string; description?: string }
      unit_amount: number
    }
    quantity: number
  }

  const lineItems: LineItem[] = [
    {
      price_data: {
        currency: 'usd',
        product_data: { name: 'PuzzleGift — Send a Puzzle', description: `Gift: "${gift.title}"` },
        unit_amount: PUZZLE_FEE_CENTS,
      },
      quantity: 1,
    },
  ]

  if (isGiftCard && gift.gift_card_amount_cents) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${gift.gift_card_brand_name ?? 'Gift Card'} — $${(gift.gift_card_amount_cents / 100).toFixed(0)}`,
          description: 'Digital gift card — purchased and locked until puzzle solved',
        },
        unit_amount: gift.gift_card_amount_cents,
      },
      quantity: 1,
    })
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Gift Card Service Fee' },
        unit_amount: GIFT_CARD_SERVICE_FEE_CENTS,
      },
      quantity: 1,
    })
  }

  let session
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/create?payment=cancelled`,
      metadata: { gift_id: gift.id, user_id: user.id },
      customer_email: user.email ?? undefined,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error'
    console.error('Stripe checkout error:', message)
    return NextResponse.json({ error: `Payment setup failed: ${message}` }, { status: 502 })
  }

  await admin
    .from('gifts')
    .update({ stripe_session_id: session.id })
    .eq('id', gift.id)

  return NextResponse.json({ url: session.url })
}
