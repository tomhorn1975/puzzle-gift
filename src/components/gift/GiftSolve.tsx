'use client'

import { useState } from 'react'
import { MultipleChoicePuzzle } from '@/components/puzzles/MultipleChoice'
import { MathPuzzle } from '@/components/puzzles/MathPuzzle'
import { ContentReveal } from '@/components/gifts/ContentReveal'
import type { SanitizedPuzzleConfig, ContentType, PuzzleType } from '@/lib/types'

interface Props {
  giftId: string
  title: string
  personalMessage: string | null
  contentType: ContentType
  puzzleType: PuzzleType
  puzzleConfig: SanitizedPuzzleConfig
}

type SolveState = 'puzzle' | 'correct' | 'wrong'

interface RevealedContent {
  type: 'text' | 'url'
  value?: string
  url?: string
}

export function GiftSolve({ giftId, title, personalMessage, contentType, puzzleConfig }: Props) {
  const [state, setState] = useState<SolveState>('puzzle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<RevealedContent | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(answers: Record<string, number>) {
    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch(`/api/gift/${giftId}/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      const data = await res.json()

      if (data.success) {
        setRevealed(data.content)
        setState('correct')
      } else {
        setState('wrong')
        setErrorMessage(data.message ?? 'Wrong answers — try again!')
      }
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
      setState('wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleRetry() {
    setState('puzzle')
    setErrorMessage(null)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-1">You have a gift</p>
          <h1 className="text-3xl font-bold">{title}</h1>
          {personalMessage && (
            <p className="mt-3 text-muted-foreground italic">&ldquo;{personalMessage}&rdquo;</p>
          )}
        </div>

        {state === 'correct' && revealed ? (
          <ContentReveal content={revealed} contentType={contentType} />
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                {state === 'wrong' ? '🔒 Not quite — try again!' : '🔒 Solve the puzzle to unlock your gift'}
              </p>
              {errorMessage && state === 'wrong' && (
                <p className="text-sm text-destructive mt-1">{errorMessage}</p>
              )}
            </div>

            {puzzleConfig.type === 'multiple_choice' ? (
              <MultipleChoicePuzzle
                config={puzzleConfig}
                onSubmit={handleSubmit}
                onRetry={handleRetry}
                loading={loading}
                showRetry={state === 'wrong'}
              />
            ) : (
              <MathPuzzle
                config={puzzleConfig}
                onSubmit={handleSubmit}
                onRetry={handleRetry}
                loading={loading}
                showRetry={state === 'wrong'}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
