import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { GiftCard } from '@/components/gifts/GiftCard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: gifts } = await supabase
    .from('gifts')
    .select(`
      id, title, personal_message, content_type, puzzle_type,
      is_active, expires_at, created_at,
      gift_access(id)
    `)
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false })

  const giftsWithCount = (gifts ?? []).map(g => ({
    ...g,
    solve_count: Array.isArray(g.gift_access) ? g.gift_access.length : 0,
    gift_access: undefined,
  }))

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight">PuzzleGift</Link>
        <div className="flex gap-3 items-center">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <form action="/api/auth/signout" method="POST">
            <Button variant="ghost" size="sm" type="submit">Sign Out</Button>
          </form>
          <Button asChild size="sm"><Link href="/create">New Gift</Link></Button>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Gifts</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {giftsWithCount.length === 0
                ? 'No gifts yet'
                : `${giftsWithCount.length} gift${giftsWithCount.length === 1 ? '' : 's'} sent`}
            </p>
          </div>
          <Button asChild><Link href="/create">Create Gift</Link></Button>
        </div>

        {giftsWithCount.length === 0 ? (
          <div className="text-center py-24 border rounded-2xl">
            <p className="text-4xl mb-4">🎁</p>
            <p className="font-semibold text-lg mb-2">No gifts yet</p>
            <p className="text-muted-foreground text-sm mb-6">Create your first puzzle gift and share it with someone special.</p>
            <Button asChild><Link href="/create">Create a Gift</Link></Button>
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
