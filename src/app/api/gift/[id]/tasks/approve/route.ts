import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const admin = createAdminClient()

  const { data: gift } = await admin
    .from('gifts')
    .select('id, sender_id, tasks_submitted_at, unlock_type')
    .eq('id', id)
    .eq('sender_id', user.id)
    .single()

  const g = gift as typeof gift & {
    unlock_type?: string
    tasks_submitted_at?: string | null
  }

  if (!g || g.unlock_type !== 'task_list')
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!g.tasks_submitted_at)
    return NextResponse.json({ error: 'Tasks not submitted yet' }, { status: 400 })

  await admin.from('gifts').update({ tasks_approved_at: new Date().toISOString() } as never).eq('id', id)

  return NextResponse.json({ ok: true })
}
