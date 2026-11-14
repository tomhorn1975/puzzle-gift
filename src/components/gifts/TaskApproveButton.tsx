'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function TaskApproveButton({ giftId }: { giftId: string }) {
  const [loading, setLoading] = useState(false)
  const [approved, setApproved] = useState(false)
  const router = useRouter()

  async function handleApprove() {
    setLoading(true)
    try {
      const res = await fetch(`/api/gift/${giftId}/tasks/approve`, { method: 'POST' })
      if (res.ok) {
        setApproved(true)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  if (approved) return <span className="text-sm text-green-600 font-semibold">✓ Approved!</span>

  return (
    <Button size="sm" onClick={handleApprove} disabled={loading} className="shrink-0">
      {loading ? 'Approving…' : 'Approve & Reveal'}
    </Button>
  )
}
