import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTasksSubmittedEmail } from '@/lib/email'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: gift } = await admin
    .from('gifts')
    .select('id, title, notification_email, tasks_submitted_at, is_active, unlock_type')
    .eq('id', id)
    .single()

  if (!gift || !gift.is_active || (gift as { unlock_type?: string }).unlock_type !== 'task_list')
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!(gift as { tasks_submitted_at?: string | null }).tasks_submitted_at) {
    await admin.from('gifts').update({ tasks_submitted_at: new Date().toISOString() } as never).eq('id', id)
    if (gift.notification_email) {
      sendTasksSubmittedEmail({ to: gift.notification_email, giftTitle: gift.title, giftId: id })
        .catch(err => console.error('Failed to send tasks-submitted email:', err))
    }
  }

  return NextResponse.json({ ok: true })
}
