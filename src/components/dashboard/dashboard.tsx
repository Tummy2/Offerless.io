'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApplicationsTable } from '@/components/applications/applications-table'
import { CreateApplicationDialog } from '@/components/applications/create-application-dialog'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { NavBar } from '@/components/layout/nav-bar'

export function Dashboard() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">📊 Dashboard</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Track your job applications and monitor your progress
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add Application
          </Button>
        </div>

        <StatsCards />

        <Card>
          <CardHeader>
            <CardTitle>Your Applications</CardTitle>
            <CardDescription>
              View and manage all your job applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationsTable />
          </CardContent>
        </Card>

        <CreateApplicationDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </main>
    </div>
  )
}