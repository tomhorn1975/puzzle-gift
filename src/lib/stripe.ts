import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-10-28.endive' })
  }
  return _stripe
}

export const PUZZLE_FEE_CENTS = 100
export const GIFT_CARD_SERVICE_FEE_CENTS = 99
