import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Use regular client for authentication check
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role client to bypass RLS policies for leaderboard data
    const serviceSupabase = createServiceClient()
    
    // Get all profiles and their application counts
    const { data: profiles, error: profilesError } = await serviceSupabase
      .from('profiles')
      .select(`
        id,
        username,
        applications (
          id,
          applied_at
        )
      `)

    if (profilesError) {
      console.error('Database error:', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }

    if (!profiles) {
      return NextResponse.json([])
    }

    // Process data to calculate totals and last 30 days
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const leaderboardData = profiles.map((profile: any) => {
      const applications = profile.applications || []
      const totalApplications = applications.length
      
      const applicationsLast30Days = applications.filter((app: any) => {
        const appliedDate = new Date(app.applied_at)
        return appliedDate >= thirtyDaysAgo
      }).length

      return {
        user_id: profile.id, // Use id as user_id for frontend compatibility
        username: profile.username,
        display_name: profile.username, // Display username
        total_applications: totalApplications,
        applications_last_30_days: applicationsLast30Days
      }
    })

    // Filter out users with no applications
    const usersWithApplications = leaderboardData.filter(entry => entry.total_applications > 0)

    // Sort by total applications (desc), then by applications in last 30 days (desc) as tiebreaker
    const sortedData = usersWithApplications.sort((a, b) => {
      if (b.total_applications !== a.total_applications) {
        return b.total_applications - a.total_applications
      }
      // Tiebreaker: most applications in last 30 days
      return b.applications_last_30_days - a.applications_last_30_days
    })

    // Add rank to each entry
    const rankedData = sortedData.map((entry, index) => ({
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