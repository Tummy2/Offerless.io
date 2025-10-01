import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NavBar } from '@/components/layout/nav-bar'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'

export default async function LeaderboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">🏆 Leaderboard</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Compete with fellow job seekers and track your application progress. 
            Only verified users appear on the leaderboard.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Global Rankings</CardTitle>
            <CardDescription>
              Rankings are based on total applications submitted. Tiebreaker: most applications in the last 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LeaderboardTable />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}