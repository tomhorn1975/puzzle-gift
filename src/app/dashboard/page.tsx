import Link from 'next/link'
import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { GiftCard } from '@/components/gifts/GiftCard'

export const instant = false

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ payment?: string }> }) {
  await connection()
  const params = await searchParams
  const paymentSuccess = params.payment === 'success'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: gifts } = await supabase
    .from('gifts')
    .select('id, title, content_type, puzzle_type, is_active, expires_at, created_at')
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false })

  // Count solves per gift
  const giftIds = (gifts ?? []).map(g => g.id)
  const { data: accessData } = giftIds.length > 0
    ? await supabase.from('gift_access').select('gift_id').in('gift_id', giftIds)
    : { data: [] }

  const solveCounts = (accessData ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.gift_id] = (acc[row.gift_id] ?? 0) + 1
    return acc
  }, {})

  const giftsWithCount = (gifts ?? []).map(g => ({
    ...g,
    solve_count: solveCounts[g.id] ?? 0,
  }))

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight">PuzzleGift</Link>
        <div className="flex gap-3 items-center">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              Sign Out
            </button>
          </form>
          <Link href="/create" className={buttonVariants({ size: 'sm' })}>New Gift</Link>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {paymentSuccess && (
          <div className="mb-6 rounded-xl border-2 border-green-500/30 bg-green-50 p-4 flex items-start gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-green-800">Payment successful! Your gift is live.</p>
              <p className="text-sm text-green-700 mt-0.5">Copy the link from your gift below and share it with your recipient.</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Gifts</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {giftsWithCount.length === 0
                ? 'No gifts yet'
                : `${giftsWithCount.length} gift${giftsWithCount.length === 1 ? '' : 's'} sent`}
            </p>
          </div>
          <Link href="/create" className={buttonVariants()}>Create Gift</Link>
        </div>

        {giftsWithCount.length === 0 ? (
          <div className="text-center py-24 border rounded-2xl">
            <p className="text-4xl mb-4">🎁</p>
            <p className="font-semibold text-lg mb-2">No gifts yet</p>
            <p className="text-muted-foreground text-sm mb-6">Create your first puzzle gift and share it with someone special.</p>
            <Link href="/create" className={buttonVariants()}>Create a Gift</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {giftsWithCount.map(gift => (
              <GiftCard key={gift.id} gift={gift} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
