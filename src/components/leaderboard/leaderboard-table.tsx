'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award } from 'lucide-react'

interface LeaderboardEntry {
  user_id: string
  username: string
  display_name?: string
  total_applications: number
  applications_last_30_days: number
  rank: number
}

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await fetch('/api/leaderboard')
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard')
  }
  return response.json()
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />
    default:
      return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
  }
}

function getUserInitials(username: string) {
  return username
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function LeaderboardTable() {
  const { data: leaderboard = [], isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-2">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-destructive">Failed to load leaderboard</p>
      </div>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No users on the leaderboard yet. Be the first to add job applications!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-center">Total Applications</TableHead>
            <TableHead className="text-center">Last 30 Days</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard.map((entry) => (
            <TableRow key={entry.user_id} className="hover:bg-muted/50">
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8 border-2 border-border">
                    <AvatarFallback className="text-sm">
                      {getUserInitials(entry.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {entry.username}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary" className="font-medium">
                  {entry.total_applications}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <span className="text-muted-foreground">
                  {entry.applications_last_30_days}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}