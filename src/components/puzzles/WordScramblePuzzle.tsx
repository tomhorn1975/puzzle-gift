'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { WordScrambleConfig } from '@/lib/types'

interface Props {
  config: WordScrambleConfig
  onSubmit: (answer: string) => void
  onRetry: () => void
  loading: boolean
  showRetry: boolean
}

export function WordScramblePuzzle({ config, onSubmit, onRetry, loading, showRetry }: Props) {
  const [answer, setAnswer] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (answer.trim()) onSubmit(answer.trim())
  }

  const letters = config.scrambled.toUpperCase().split('')

  return (
    <div className="space-y-5">
      <div className="text-center space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Unscramble the word</p>
        <div className="flex flex-wrap justify-center gap-2">
          {letters.map((letter, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-lg border-2 border-primary/40 bg-primary/5 flex items-center justify-center font-heading font-bold text-lg text-primary"
            >
              {letter}
            </div>
          ))}
        </div>
        {config.hint && (
          <p className="text-sm text-muted-foreground">
            💡 Hint: {config.hint}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Type your answer…"
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
