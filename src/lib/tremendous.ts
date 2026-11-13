const TREMENDOUS_BASE = process.env.TREMENDOUS_SANDBOX === 'true'
  ? 'https://testflight.tremendous.com/api/v2'
  : 'https://www.tremendous.com/api/v2'

export interface GiftCardBrand {
  id: string
  name: string
  emoji: string
  amounts: number[]
}

export const GIFT_CARD_BRANDS: GiftCardBrand[] = [
  { id: 'AMAZONG3HV5',    name: 'Amazon',    emoji: '📦', amounts: [10, 25, 50, 100, 200] },
  { id: 'V_STARBUCKS01',  name: 'Starbucks', emoji: '☕', amounts: [10, 25, 50]            },
  { id: 'V_APPLE_GC01',   name: 'Apple',     emoji: '🍎', amounts: [15, 25, 50, 100]       },
  { id: 'V_NETFLIX01',    name: 'Netflix',   emoji: '🎬', amounts: [15, 25, 30]            },
  { id: 'V_TARGET_GC01',  name: 'Target',    emoji: '🎯', amounts: [10, 25, 50, 100]       },
  { id: 'V_WALMART01',    name: 'Walmart',   emoji: '🛒', amounts: [10, 25, 50, 100]       },
  { id: 'V_DOORDASH01',   name: 'DoorDash',  emoji: '🍔', amounts: [15, 25, 50]            },
  { id: 'V_SPOTIFY01',    name: 'Spotify',   emoji: '🎵', amounts: [10, 30, 60]            },
  { id: 'V_UBER01',       name: 'Uber',      emoji: '🚗', amounts: [10, 25, 50]            },
  { id: 'V_AIRBNB01',     name: 'Airbnb',    emoji: '🏠', amounts: [25, 50, 100, 200]      },
]

const isMocked = !process.env.TREMENDOUS_API_KEY || process.env.TREMENDOUS_API_KEY === 'TEST_REPLACE_ME'

export async function purchaseGiftCard(productId: string, amountDollars: number): Promise<string> {
  if (isMocked) {
    const brand = GIFT_CARD_BRANDS.find(b => b.id === productId)
    console.warn(`[DEV MOCK] Skipping Tremendous API — returning fake claim link for $${amountDollars} ${brand?.name ?? productId}`)
    return `https://www.tremendous.com/mock-claim?product=${productId}&amount=${amountDollars}&demo=true`
  }

  const res = await fetch(`${TREMENDOUS_BASE}/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.TREMENDOUS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      payment: { funding_source_id: 'BALANCE' },
      rewards: [{
        value: { denomination: amountDollars, currency_code: 'USD' },
        delivery: { method: 'LINK' },
        products: [productId],
      }],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Tremendous error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const reward = data.order?.rewards?.[0]
  if (!reward) throw new Error('No reward in Tremendous response')

  if (reward.delivery?.link) return reward.delivery.link

  const rewardRes = await fetch(`${TREMENDOUS_BASE}/rewards/${reward.id}`, {
    headers: { Authorization: `Bearer ${process.env.TREMENDOUS_API_KEY}` },
  })
  if (!rewardRes.ok) throw new Error(`Failed to fetch reward: ${rewardRes.status}`)
  const rewardData = await rewardRes.json()
  const link = rewardData.reward?.delivery?.link
  if (!link) throw new Error('Could not retrieve gift card claim link')
  return link
}
