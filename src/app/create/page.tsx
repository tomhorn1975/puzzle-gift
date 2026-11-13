import Link from 'next/link'
import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GiftForm } from '@/components/create/GiftForm'

export const instant = false

export default async function CreatePage() {
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/create')

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight">PuzzleGift</Link>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to My Gifts
        </Link>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Create a Puzzle Gift</h1>
          <p className="text-muted-foreground text-sm mt-1">Your recipient will solve a puzzle to unlock it.</p>
        </div>
        <GiftForm userId={user.id} />
      </main>
    </div>
  )
}
