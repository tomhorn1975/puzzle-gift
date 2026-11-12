import type { TriviaQuestion } from '@/lib/types'

export const TRIVIA_CATEGORIES = [
  { id: 9,  name: 'General Knowledge' },
  { id: 23, name: 'History' },
  { id: 22, name: 'Geography' },
  { id: 17, name: 'Science & Nature' },
  { id: 21, name: 'Sports' },
  { id: 11, name: 'Movies' },
  { id: 12, name: 'Music' },
  { id: 15, name: 'Video Games' },
  { id: 27, name: 'Animals' },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface OpenTDBResult {
  question: string
  correct_answer: string
  incorrect_answers: string[]
}

interface OpenTDBResponse {
  response_code: number
  results: OpenTDBResult[]
}

export async function fetchTriviaQuestions(
  categoryId: number,
  difficulty: string,
  count: number
): Promise<TriviaQuestion[]> {
  const url = `https://opentdb.com/api.php?amount=${count}&category=${categoryId}&difficulty=${difficulty}&type=multiple&encode=url3986`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch trivia questions')
  const data: OpenTDBResponse = await res.json()
  if (data.response_code !== 0) throw new Error('Not enough trivia questions available for this category/difficulty')

  return data.results.map(result => {
    const correct = decodeURIComponent(result.correct_answer)
    const incorrects = result.incorrect_answers.map(s => decodeURIComponent(s))
    const options = shuffle([correct, ...incorrects])
    const answer_index = options.indexOf(correct)
    return {
      id: crypto.randomUUID(),
      question: decodeURIComponent(result.question),
      options,
      answer_index,
    }
  })
}
