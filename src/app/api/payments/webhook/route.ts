import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { purchaseGiftCard } from '@/lib/tremendous'
import { sendGiftCreatedEmail } from '@/lib/email'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const giftId = session.metadata?.gift_id
  if (!giftId) return NextResponse.json({ received: true })

  const admin = createAdminClient()

  const { data: gift } = await admin
    .from('gifts')
    .select('id, title, content_type, gift_card_brand_id, gift_card_brand_name, gift_card_amount_cents, notification_email, payment_status')
    .eq('id', giftId)
    .single()

  if (!gift || gift.payment_status === 'paid') {
    return NextResponse.json({ received: true })
  }

  const isGiftCard = gift.content_type === 'gift_card'
  let giftCardCode: string | null = null

  if (isGiftCard && gift.gift_card_brand_id && gift.gift_card_amount_cents) {
    try {
      const amountDollars = gift.gift_card_amount_cents / 100
      giftCardCode = await purchaseGiftCard(gift.gift_card_brand_id, amountDollars)
    } catch (err) {
      console.error('Tremendous purchase failed:', err)
      await admin.from('gifts').update({ payment_status: 'failed' }).eq('id', giftId)
      return NextResponse.json({ error: 'Gift card purchase failed' }, { status: 500 })
    }
  }

  await admin.from('gifts').update({
    is_active: true,
    payment_status: 'paid',
    ...(giftCardCode ? { gift_card_code: giftCardCode } : {}),
  }).eq('id', giftId)

  if (gift.notification_email) {
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const shareUrl = `${origin}/gift/${giftId}`
    try {
      await sendGiftCreatedEmail({
        to: gift.notification_email,
        giftTitle: gift.title,
        shareUrl,
        isGiftCard,
        brandName: gift.gift_card_brand_name ?? undefined,
        amountDollars: gift.gift_card_amount_cents ? gift.gift_card_amount_cents / 100 : undefined,
      })
    } catch (err) {
      console.error('Failed to send gift created email:', err)
    }
  }

  return NextResponse.json({ received: true })
}
