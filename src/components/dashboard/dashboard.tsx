'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Track your job applications and monitor your progress
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </div>

        <StatsCards />

        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
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