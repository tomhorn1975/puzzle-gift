'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SanitizedRiddleConfig } from '@/lib/types'

interface Props {
  config: SanitizedRiddleConfig
  onSubmit: (answer: string) => void
  onRetry: () => void
  loading: boolean
  showRetry: boolean
}

export function RiddlePuzzle({ config, onSubmit, onRetry, loading, showRetry }: Props) {
  const [answer, setAnswer] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (answer.trim()) onSubmit(answer.trim())
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 text-center space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Solve the riddle</p>
        <p className="font-heading font-semibold text-lg leading-snug">{config.question}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Your answer…"
          className="text-center text-lg font-semibold"
          autoComplete="off"
          autoFocus
        />
        {showRetry ? (
          <Button type="button" variant="outline" className="w-full" onClick={onRetry}>
            Try Again
          </Button>
        ) : (
          <Button type="submit" className="w-full" disabled={loading || !answer.trim()}>
            {loading ? 'Checking…' : 'Submit Answer →'}
          </Button>
        )}
      </form>
    </div>
  )
}
