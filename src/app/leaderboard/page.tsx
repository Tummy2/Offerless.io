import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LeaderboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Offerless
            </span>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/" className="text-sm font-medium">
              Dashboard
            </Link>
            <Button variant="outline" size="sm">
              Sign Out
            </Button>
          </nav>
        </div>
      </header>
      
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
              Rankings are based on total applications submitted. 
              Add some applications to see your position!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Start adding job applications to compete on the leaderboard.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}