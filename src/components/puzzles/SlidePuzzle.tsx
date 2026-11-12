'use client'

import { useState } from 'react'

interface Props {
  imageUrl: string
  gridSize: 3 | 4
  onSolve: () => void
}

function scramble(gridSize: number): number[] {
  const n = gridSize * gridSize
  // solved state: [1, 2, ..., n-1, 0]
  const tiles = [...Array(n - 1).keys()].map(i => i + 1)
  tiles.push(0)

  for (let i = 0; i < 150; i++) {
    const emptyIdx = tiles.indexOf(0)
    const emptyRow = Math.floor(emptyIdx / gridSize)
    const emptyCol = emptyIdx % gridSize
    const moves: number[] = []
    if (emptyRow > 0) moves.push(emptyIdx - gridSize)
    if (emptyRow < gridSize - 1) moves.push(emptyIdx + gridSize)
    if (emptyCol > 0) moves.push(emptyIdx - 1)
    if (emptyCol < gridSize - 1) moves.push(emptyIdx + 1)
    const swapIdx = moves[Math.floor(Math.random() * moves.length)]
    ;[tiles[emptyIdx], tiles[swapIdx]] = [tiles[swapIdx], tiles[emptyIdx]]
  }
  return tiles
}

function isSolved(tiles: number[], gridSize: number): boolean {
  const n = gridSize * gridSize
  return tiles.every((t, i) => t === (i + 1) % n)
}

const TILE_SIZE = 90

export function SlidePuzzle({ imageUrl, gridSize, onSolve }: Props) {
  const [tiles, setTiles] = useState<number[]>(() => scramble(gridSize))
  const [moves, setMoves] = useState(0)
  const totalSize = TILE_SIZE * gridSize

  function handleClick(idx: number) {
    const emptyIdx = tiles.indexOf(0)
    const row = Math.floor(idx / gridSize)
    const col = idx % gridSize
    const emptyRow = Math.floor(emptyIdx / gridSize)
    const emptyCol = emptyIdx % gridSize

    const isAdjacent =
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1)

    if (!isAdjacent) return

    const next = [...tiles]
    ;[next[emptyIdx], next[idx]] = [next[idx], next[emptyIdx]]
    setTiles(next)
    setMoves(m => m + 1)

    if (isSolved(next, gridSize)) {
      setTimeout(onSolve, 300)
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-center text-sm text-muted-foreground">
        Slide the tiles to assemble the image &mdash; {moves} move{moves !== 1 ? 's' : ''}
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
          {tiles.map((tile, idx) => {
            if (tile === 0) {
              return (
                <div
                  key={idx}
                  style={{ width: TILE_SIZE, height: TILE_SIZE }}
                  className="bg-muted rounded-sm"
                />
              )
            }
            const origCol = (tile - 1) % gridSize
            const origRow = Math.floor((tile - 1) / gridSize)
            const emptyIdx = tiles.indexOf(0)
            const row = Math.floor(idx / gridSize)
            const col = idx % gridSize
            const emptyRow = Math.floor(emptyIdx / gridSize)
            const emptyCol = emptyIdx % gridSize
            const isAdjacent =
              (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
              (col === emptyCol && Math.abs(row - emptyRow) === 1)

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
                  cursor: isAdjacent ? 'pointer' : 'default',
                }}
                className={`rounded-sm border border-background select-none transition-transform ${
                  isAdjacent ? 'hover:brightness-110' : ''
                }`}
              />
            )
          })}
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Click a tile next to the empty space to slide it
      </p>
    </div>
  )
}
