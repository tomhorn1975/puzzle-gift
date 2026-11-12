'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface GiftSummary {
  id: string
  title: string
  puzzle_type: string
  content_type: string
  is_active: boolean
  created_at: string
  solve_count: number
}

interface Props {
  gift: GiftSummary
}

export function GiftCard({ gift }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [toggling, setToggling] = useState(false)

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/gift/${gift.id}`

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function toggleActive() {
    setToggling(true)
    await supabase.from('gifts').update({ is_active: !gift.is_active }).eq('id', gift.id)
    router.refresh()
    setToggling(false)
  }

  const puzzleLabel = gift.puzzle_type === 'multiple_choice' ? 'Multiple Choice' : 'Math'
  const contentLabel = gift.content_type === 'text' ? 'Text' : gift.content_type === 'image' ? 'Image' : 'File'
  const createdDate = new Date(gift.created_at).toLocaleDateString()

  return (
    <Card className={gift.is_active ? '' : 'opacity-60'}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold truncate">{gift.title}</h3>
              {!gift.is_active && <Badge variant="secondary">Inactive</Badge>}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Badge variant="outline">{puzzleLabel}</Badge>
              <Badge variant="outline">{contentLabel}</Badge>
              <span>{createdDate}</span>
              <span>{gift.solve_count} {gift.solve_count === 1 ? 'solve' : 'solves'}</span>
            </div>
          </div>
          <div className="flex gap-2 items-center shrink-0">
            <Button size="sm" variant="outline" onClick={copyLink}>
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button size="sm" variant="ghost" onClick={toggleActive} disabled={toggling}>
              {gift.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
