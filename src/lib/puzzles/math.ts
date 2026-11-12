import type { StoredMathProblem } from '@/lib/types'

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function easyProblem(): StoredMathProblem {
  const a = rand(1, 20)
  const b = rand(1, 20)
  if (Math.random() < 0.5) {
    return { id: crypto.randomUUID(), expression: `${a} + ${b} = ?`, answer: a + b }
  }
  const [big, small] = a >= b ? [a, b] : [b, a]
  return { id: crypto.randomUUID(), expression: `${big} − ${small} = ?`, answer: big - small }
}

function mediumProblem(): StoredMathProblem {
  if (Math.random() < 0.5) {
    const a = rand(2, 12)
    const b = rand(2, 12)
    return { id: crypto.randomUUID(), expression: `${a} × ${b} = ?`, answer: a * b }
  }
  const b = rand(2, 12)
  const answer = rand(2, 12)
  return { id: crypto.randomUUID(), expression: `${b * answer} ÷ ${b} = ?`, answer }
}

function hardProblem(): StoredMathProblem {
  const type = rand(0, 2)
  if (type === 0) {
    const a = rand(11, 25)
    const b = rand(3, 9)
    return { id: crypto.randomUUID(), expression: `${a} × ${b} = ?`, answer: a * b }
  }
  if (type === 1) {
    const percents = [10, 20, 25, 50]
    const pct = percents[rand(0, percents.length - 1)]
    const base = rand(2, 10) * 10
    return { id: crypto.randomUUID(), expression: `${pct}% of ${base} = ?`, answer: (pct / 100) * base }
  }
  const n = rand(2, 12)
  return { id: crypto.randomUUID(), expression: `${n}² = ?`, answer: n * n }
}

export function generateMathProblems(
  difficulty: 'easy' | 'medium' | 'hard',
  count: number
): StoredMathProblem[] {
  const gen = difficulty === 'easy' ? easyProblem : difficulty === 'medium' ? mediumProblem : hardProblem
  return Array.from({ length: count }, gen)
}
