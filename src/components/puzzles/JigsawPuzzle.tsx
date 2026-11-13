'use client'

import { useState, useEffect } from 'react'

interface Props {
  imageUrl: string
  gridSize: 3 | 4
  onSolve: () => void
}

function shuffled(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i + 1)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  if (arr.every((v, i) => v === i + 1)) arr[0] = arr.splice(1, 1, arr[0])[0]
  return arr
}

function isSolved(pieces: number[]): boolean {
  return pieces.every((p, i) => p === i + 1)
}

const TILE_SIZE = 90

export function JigsawPuzzle({ imageUrl, gridSize, onSolve }: Props) {
  const n = gridSize * gridSize
  const totalSize = TILE_SIZE * gridSize
  const [pieces, setPieces] = useState<number[] | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)

  useEffect(() => {
    setPieces(shuffled(n))
  }, [n])

  function handleClick(idx: number) {
    if (!pieces) return
    if (selected === null) {
      setSelected(idx)
      return
    }
    if (selected === idx) {
      setSelected(null)
      return
    }
    const next = [...pieces]
    ;[next[selected], next[idx]] = [next[idx], next[selected]]
    setPieces(next)
    setSelected(null)
    setMoves(m => m + 1)
    if (isSolved(next)) setTimeout(onSolve, 300)
  }

  if (!pieces) {
    return (
      <div className="flex justify-center">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, ${TILE_SIZE}px)`,
            gap: 2,
            width: totalSize + (gridSize - 1) * 2,
          }}
        >
          {Array.from({ length: n }).map((_, i) => (
            <div key={i} style={{ width: TILE_SIZE, height: TILE_SIZE }} className="bg-muted rounded-sm animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-center text-sm text-muted-foreground">
        Tap two pieces to swap them &mdash; {moves} swap{moves !== 1 ? 's' : ''}
      </div>
      <div className="flex justify-center">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, ${TILE_SIZE}px)`,
            gap: 2,
            width: totalSize + (gridSize - 1) * 2,
          }}
        >
          {pieces.map((piece, idx) => {
            const origCol = (piece - 1) % gridSize
            const origRow = Math.floor((piece - 1) / gridSize)
            const isSelected = selected === idx
            return (
              <div
                key={idx}
                onClick={() => handleClick(idx)}
                style={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: `${totalSize}px ${totalSize}px`,
                  backgroundPosition: `-${origCol * TILE_SIZE}px -${origRow * TILE_SIZE}px`,
                  cursor: 'pointer',
                }}
                className={`rounded-sm select-none transition-all ${
                  isSelected
                    ? 'ring-2 ring-primary ring-offset-1 scale-95'
                    : 'border border-background hover:brightness-110'
                }`}
              />
            )
          })}
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {selected !== null ? 'Now tap another piece to swap' : 'Tap a piece to select it'}
      </p>
    </div>
  )
}
