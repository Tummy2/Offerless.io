'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getStatusIcon } from '@/lib/utils'
import type { ApplicationStats } from '@/types'

async function fetchStats(): Promise<ApplicationStats> {
  const response = await fetch('/api/me/stats')
  if (!response.ok) {
    throw new Error('Failed to fetch stats')
  }
  return response.json()
}

export function StatsCards() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['user-stats'],
    queryFn: fetchStats,
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <div className="h-3 bg-muted animate-pulse rounded mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Failed to load statistics</p>
        </CardContent>
      </Card>
    )
  }

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.total,
      icon: '📊',
      description: 'All applications',
      color: 'text-blue-600',
    },
    {
      title: 'Applied',
      value: stats.applied,
      icon: getStatusIcon('applied'),
      description: 'Recently submitted',
      color: 'text-blue-600',
    },
    {
      title: 'Interviewing',
      value: stats.interviewing,
      icon: getStatusIcon('interviewing'),
      description: 'In progress',
      color: 'text-yellow-600',
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: getStatusIcon('rejected'),
      description: 'Not selected',
      color: 'text-red-600',
    },
    {
      title: 'Ghosted',
      value: stats.ghosted,
      icon: getStatusIcon('ghosted'),
      description: 'No response',
      color: 'text-gray-600',
    },
    {
      title: 'Offers',
      value: stats.offer,
      icon: getStatusIcon('offer'),
      description: 'Success!',
      color: 'text-green-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <span className="text-lg">{stat.icon}</span>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}