'use client'

import { useState } from 'react'
import { TriviaPuzzle } from '@/components/puzzles/TriviaPuzzle'
import { MathPuzzle } from '@/components/puzzles/MathPuzzle'
import { SlidePuzzle } from '@/components/puzzles/SlidePuzzle'
import { JigsawPuzzle } from '@/components/puzzles/JigsawPuzzle'
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
  type: 'text' | 'url' | 'assembled'
  value?: string
  url?: string
  image_url?: string
  message?: string | null
}

export function GiftSolve({ giftId, title, personalMessage, contentType, puzzleType, puzzleConfig }: Props) {
  const [state, setState]               = useState<SolveState>('puzzle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [revealed, setRevealed]         = useState<RevealedContent | null>(null)
  const [loading, setLoading]           = useState(false)

  async function callSolveApi(body: object) {
    const res  = await fetch(`/api/gift/${giftId}/solve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.json()
  }

  async function handleAnswerSubmit(answers: Record<string, number>) {
    setLoading(true)
    setErrorMessage(null)
    try {
      const data = await callSolveApi({ answers })
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

  async function handlePuzzleSolved() {
    setLoading(true)
    try {
      const data = await callSolveApi({ solved: true })
      if (data.success) {
        setRevealed(data.content)
        setState('correct')
      }
    } catch {
      setState('correct')
    } finally {
      setLoading(false)
    }
  }

  function handleRetry() {
    setState('puzzle')
    setErrorMessage(null)
  }

  const isImagePuzzle = puzzleType === 'slide' || puzzleType === 'jigsaw'

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-6 bg-background">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div
            className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white mb-4"
            style={{ background: 'linear-gradient(135deg, oklch(0.52 0.27 292), oklch(0.65 0.26 345))' }}
          >
            🎁 You have a gift!
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl">{title}</h1>
          {personalMessage && !isImagePuzzle && (
            <p className="mt-3 text-muted-foreground italic text-base max-w-sm mx-auto">&ldquo;{personalMessage}&rdquo;</p>
          )}
        </div>

        {state === 'correct' && revealed ? (
          <ContentReveal content={revealed} contentType={contentType} />
        ) : (
          <div className="space-y-4">
            {!isImagePuzzle && (
              <div className="text-center">
                <p className={`text-sm font-semibold ${state === 'wrong' ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {state === 'wrong' ? '🔐 Not quite right — give it another shot!' : '🔒 Solve the puzzle to unlock your gift'}
                </p>
                {errorMessage && state === 'wrong' && (
                  <p className="text-sm text-destructive mt-1">{errorMessage}</p>
                )}
              </div>
            )}

            {isImagePuzzle && (
              <div className="text-center mb-2">
                <p className="text-sm font-semibold text-muted-foreground">
                  {loading ? 'Unlocking…' : '🔒 Solve the puzzle to reveal your gift'}
                </p>
              </div>
            )}

            {puzzleConfig.type === 'trivia' && (
              <TriviaPuzzle
                config={puzzleConfig}
                onSubmit={handleAnswerSubmit}
                onRetry={handleRetry}
                loading={loading}
                showRetry={state === 'wrong'}
              />
            )}

            {puzzleConfig.type === 'math' && (
              <MathPuzzle
                config={puzzleConfig}
                onSubmit={handleAnswerSubmit}
                onRetry={handleRetry}
                loading={loading}
                showRetry={state === 'wrong'}
              />
            )}

            {puzzleConfig.type === 'slide' && (
              <SlidePuzzle
                imageUrl={puzzleConfig.image_url}
                gridSize={puzzleConfig.grid_size}
                onSolve={handlePuzzleSolved}
              />
            )}

            {puzzleConfig.type === 'jigsaw' && (
              <JigsawPuzzle
                imageUrl={puzzleConfig.image_url}
                gridSize={puzzleConfig.grid_size}
                onSolve={handlePuzzleSolved}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
