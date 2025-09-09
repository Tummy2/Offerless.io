'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
              Rejected.gg
            </span>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/leaderboard" className="text-sm font-medium">
              Leaderboard
            </Link>
            <Button variant="outline" size="sm">
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">🎯 Dashboard</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Welcome to your job application tracker!
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <span className="text-2xl">📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Start tracking your applications
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <span className="text-2xl">🗣️</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Currently interviewing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <span className="text-2xl">❌</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Keep pushing forward
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offers</CardTitle>
              <span className="text-2xl">🎉</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Your future success
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>🚀 Get Started</CardTitle>
              <CardDescription>
                Set up your Supabase database to start tracking applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">1. Set up your database</h3>
                <p className="text-sm text-muted-foreground">
                  Run the following commands to create your database tables:
                </p>
                <code className="block p-2 bg-muted rounded text-sm">
                  supabase link --project-ref YOUR_PROJECT_REF<br/>
                  supabase db push<br/>
                  npm run supabase:gen-types
                </code>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">2. Add your first application</h3>
                <p className="text-sm text-muted-foreground">
                  Once your database is set up, you can start tracking job applications!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📈 Features</CardTitle>
              <CardDescription>
                What you can do with Rejected.gg
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <span>✅</span>
                <span className="text-sm">Track job applications with status updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>✅</span>
                <span className="text-sm">Monitor your progress with real-time stats</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>✅</span>
                <span className="text-sm">Compete on the global leaderboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>✅</span>
                <span className="text-sm">Export your data as CSV</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>✅</span>
                <span className="text-sm">Dark/light theme support</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}