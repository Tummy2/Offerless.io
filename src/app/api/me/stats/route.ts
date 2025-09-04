import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: applications, error } = await supabase
      .from('applications')
      .select('status')
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      )
    }

    const stats = {
      total: applications.length,
      applied: applications.filter(app => app.status === 'applied').length,
      interviewing: applications.filter(app => app.status === 'interviewing').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      ghosted: applications.filter(app => app.status === 'ghosted').length,
      offer: applications.filter(app => app.status === 'offer').length,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}