import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profiles with application counts
    const { data: leaderboardData, error } = await supabase
      .rpc('get_leaderboard_data')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }

    // Sort by total applications (desc), then by applications in last 30 days (desc) as tiebreaker
    const sortedData = (leaderboardData || []).sort((a: any, b: any) => {
      if (b.total_applications !== a.total_applications) {
        return b.total_applications - a.total_applications
      }
      // Tiebreaker: most applications in last 30 days
      return b.applications_last_30_days - a.applications_last_30_days
    })

    // Add rank to each entry
    const rankedData = sortedData.map((entry: any, index: number) => ({
      ...entry,
      rank: index + 1
    }))

    return NextResponse.json(rankedData)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}