'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import type { ContentType } from '@/lib/types'

interface Content {
  type: 'text' | 'url'
  value?: string
  url?: string
}

interface Props {
  content: Content
  contentType: ContentType
}

export function ContentReveal({ content, contentType }: Props) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center py-4">
        <p className="text-4xl mb-2">🎉</p>
        <p className="font-semibold text-lg">You unlocked it!</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {content.type === 'text' && (
            <p className="text-base leading-relaxed whitespace-pre-wrap">{content.value}</p>
          )}

          {content.type === 'url' && contentType === 'image' && content.url && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <Image
                src={content.url}
                alt="Gift content"
                fill
                className="object-contain"
                unoptimized
              />
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
        </CardContent>
      </Card>
    </div>
  )
}
