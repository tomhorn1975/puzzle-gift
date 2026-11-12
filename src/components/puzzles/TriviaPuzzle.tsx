'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SanitizedTriviaConfig } from '@/lib/types'

interface Props {
  config: SanitizedTriviaConfig
  onSubmit: (answers: Record<string, number>) => void
  onRetry: () => void
  loading: boolean
  showRetry: boolean
}

export function TriviaPuzzle({ config, onSubmit, onRetry, loading, showRetry }: Props) {
  const [selected, setSelected] = useState<Record<string, number>>({})

  const allAnswered = config.questions.every(q => selected[q.id] !== undefined)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (allAnswered) onSubmit(selected)
  }

  if (showRetry) {
    return (
      <div className="text-center py-8">
        <Button onClick={onRetry} variant="outline">Try Again</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {config.questions.map((q, qIdx) => (
        <Card key={q.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {qIdx + 1}. {q.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {q.options.map((option, oIdx) => (
              <label
                key={oIdx}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selected[q.id] === oIdx
                    ? 'border-foreground bg-muted'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={selected[q.id] === oIdx}
                  onChange={() => setSelected(s => ({ ...s, [q.id]: oIdx }))}
                  className="sr-only"
                />
                <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  selected[q.id] === oIdx ? 'border-foreground bg-foreground' : 'border-muted-foreground'
                }`}>
                  {selected[q.id] === oIdx && (
                    <span className="w-2 h-2 rounded-full bg-background block" />
                  )}
                </span>
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      ))}

      <Button type="submit" size="lg" className="w-full" disabled={!allAnswered || loading}>
        {loading ? 'Checking...' : 'Submit Answers'}
      </Button>
    </form>
  )
}
