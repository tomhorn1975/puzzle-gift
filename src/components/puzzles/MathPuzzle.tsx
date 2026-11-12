'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SanitizedMathPuzzleConfig } from '@/lib/types'

interface Props {
  config: SanitizedMathPuzzleConfig
  onSubmit: (answers: Record<string, number>) => void
  onRetry: () => void
  loading: boolean
  showRetry: boolean
}

export function MathPuzzle({ config, onSubmit, onRetry, loading, showRetry }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const allAnswered = config.problems.every(p => answers[p.id]?.trim() !== '' && answers[p.id] !== undefined)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allAnswered) return
    const numericAnswers = Object.fromEntries(
      Object.entries(answers).map(([k, v]) => [k, Number(v)])
    )
    onSubmit(numericAnswers)
  }

  if (showRetry) {
    return (
      <div className="text-center py-8">
        <Button onClick={() => { setAnswers({}); onRetry() }} variant="outline">Try Again</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {config.problems.map((p, pIdx) => (
        <Card key={p.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {pIdx + 1}. {p.expression}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              value={answers[p.id] ?? ''}
              onChange={e => setAnswers(a => ({ ...a, [p.id]: e.target.value }))}
              placeholder="Your answer"
              className="max-w-[160px]"
            />
          </CardContent>
        </Card>
      ))}

      <Button type="submit" size="lg" className="w-full" disabled={!allAnswered || loading}>
        {loading ? 'Checking...' : 'Submit Answers'}
      </Button>
    </form>
  )
}
