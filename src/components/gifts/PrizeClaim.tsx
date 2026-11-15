'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  giftId: string
  productTitle?: string | null
  productImage?: string | null
  prizeAmountCents?: number | null
}

export function PrizeClaim({ giftId, productTitle, productImage, prizeAmountCents }: Props) {
  const [step, setStep] = useState<'product' | 'address' | 'done'>('product')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', address1: '', address2: '', city: '', state: '', zip: '', country: 'US' })
  const [error, setError] = useState<string | null>(null)

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.name || !form.address1 || !form.city || !form.state || !form.zip) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/gift/${giftId}/prize/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, address1: form.address1, address2: form.address2, city: form.city, state: form.state, zip: form.zip, country: form.country }),
      })
      if (res.ok) setStep('done')
      else setError('Something went wrong. Please try again.')
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  if (step === 'done') {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="text-5xl">📦</div>
        <h3 className="font-heading font-bold text-lg">Prize on its way!</h3>
        <p className="text-sm text-muted-foreground">Your sender has been notified with your address. Expect your prize soon!</p>
      </div>
    )
  }

  if (step === 'address') {
    return (
      <form onSubmit={handleClaim} className="space-y-4">
        <p className="text-sm font-semibold text-center">📦 Enter your shipping address</p>
        <div className="space-y-3">
          <div>
            <Label>Full name *</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Smith" />
          </div>
          <div>
            <Label>Address line 1 *</Label>
            <Input value={form.address1} onChange={e => set('address1', e.target.value)} placeholder="123 Main St" />
          </div>
          <div>
            <Label>Address line 2</Label>
            <Input value={form.address2} onChange={e => set('address2', e.target.value)} placeholder="Apt 4B (optional)" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>City *</Label>
              <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="New York" />
            </div>
            <div>
              <Label>State *</Label>
              <Input value={form.state} onChange={e => set('state', e.target.value)} placeholder="NY" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>ZIP code *</Label>
              <Input value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="10001" />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={form.country} onChange={e => set('country', e.target.value)} placeholder="US" />
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Submitting…' : 'Claim My Prize 🎁'}
        </Button>
      </form>
    )
  }

  return (
    <div className="space-y-5 text-center">
      {productImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={productImage} alt={productTitle ?? 'Prize'} className="w-40 h-40 object-contain mx-auto rounded-xl border" />
      )}
      <div>
        <p className="font-heading font-bold text-lg">{productTitle ?? 'Your Prize'}</p>
        {prizeAmountCents && (
          <p className="text-sm text-muted-foreground">Value: ${(prizeAmountCents / 100).toFixed(0)}</p>
        )}
      </div>
      <p className="text-sm text-muted-foreground">Your sender has set aside a prize for you! Enter your shipping address to claim it.</p>
      <Button className="w-full" onClick={() => setStep('address')}>
        Enter Shipping Address →
      </Button>
    </div>
  )
}
