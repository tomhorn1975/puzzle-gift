'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import type { ContentType } from '@/lib/types'

interface Content {
  type: 'text' | 'url' | 'assembled' | 'gift_card'
  value?: string
  url?: string
  image_url?: string
  message?: string | null
  brand_name?: string
  amount_cents?: number
  claim_link?: string
}

interface Props {
  content: Content
  contentType: ContentType
}

export function ContentReveal({ content, contentType }: Props) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center py-6">
        <div className="text-6xl mb-3 animate-bounce">🎉</div>
        <h2 className="font-heading font-extrabold text-3xl mb-1 text-gradient-primary">You unlocked it!</h2>
        <p className="text-muted-foreground text-sm">Congratulations — you earned this gift 🏆</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {content.type === 'text' && (
            <p className="text-base leading-relaxed whitespace-pre-wrap">{content.value}</p>
          )}

          {content.type === 'url' && contentType === 'image' && content.url && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <Image src={content.url} alt="Gift content" fill className="object-contain" unoptimized />
            </div>
          )}

          {content.type === 'url' && contentType === 'file' && content.url && (
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-4">Your file is ready to download.</p>
              <a
                href={content.url}
                download
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Download File
              </a>
            </div>
          )}

          {content.type === 'assembled' && content.image_url && (
            <div className="space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.image_url} alt="Assembled puzzle" className="w-full rounded-xl" />
              {content.message && (
                <p className="text-base leading-relaxed text-center italic text-muted-foreground">
                  &ldquo;{content.message}&rdquo;
                </p>
              )}
            </div>
          )}
          {content.type === 'gift_card' && content.claim_link && (
            <div className="text-center space-y-5 py-2">
              <div className="text-5xl">💳</div>
              <div>
                <p className="font-heading font-bold text-xl mb-1">
                  {content.brand_name ?? 'Gift Card'} — ${content.amount_cents ? (content.amount_cents / 100).toFixed(0) : ''}
                </p>
                <p className="text-sm text-muted-foreground">Your gift card is ready. Click below to claim it.</p>
              </div>
              <a
                href={content.claim_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, oklch(0.52 0.27 292), oklch(0.65 0.26 345))' }}
              >
                Claim Your Gift Card →
              </a>
              <p className="text-xs text-muted-foreground">Link opens in a new tab. Save it somewhere safe!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
