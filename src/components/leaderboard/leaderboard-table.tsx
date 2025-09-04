'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { LeaderboardEntry } from '@/types'
import { Trophy, Medal, Award } from 'lucide-react'

const columns: ColumnDef<LeaderboardEntry>[] = [
  {
    accessorKey: 'rank',
    header: 'Rank',
    cell: ({ row }) => {
      const rank = row.getValue('rank') as number
      let icon = null
      
      if (rank === 1) {
        icon = <Trophy className="h-4 w-4 text-yellow-500" />
      } else if (rank === 2) {
        icon = <Medal className="h-4 w-4 text-gray-400" />
      } else if (rank === 3) {
        icon = <Award className="h-4 w-4 text-amber-600" />
      }
      
      return (
        <div className="flex items-center gap-2 font-medium">
          {icon}
          #{rank}
        </div>
      )
    },
  },
  {
    accessorKey: 'username',
    header: 'User',
    cell: ({ row }) => {
      const username = row.getValue('username') as string
      const displayName = row.original.display_name
      return (
        <div>
          <div className="font-medium">{displayName || username}</div>
          {displayName && (
            <div className="text-sm text-muted-foreground">@{username}</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'total_apps',
    header: 'Total Applications',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.getValue('total_apps')}
      </Badge>
    ),
  },
  {
    accessorKey: 'count_applied',
    header: 'Applied',
    cell: ({ row }) => (
      <div className="text-center font-mono text-blue-600">
        {row.getValue('count_applied')}
      </div>
    ),
  },
  {
    accessorKey: 'count_interviewing',
    header: 'Interviewing',
    cell: ({ row }) => (
      <div className="text-center font-mono text-yellow-600">
        {row.getValue('count_interviewing')}
      </div>
    ),
  },
  {
    accessorKey: 'count_rejected',
    header: 'Rejected',
    cell: ({ row }) => (
      <div className="text-center font-mono text-red-600">
        {row.getValue('count_rejected')}
      </div>
    ),
  },
  {
    accessorKey: 'count_ghosted',
    header: 'Ghosted',
    cell: ({ row }) => (
      <div className="text-center font-mono text-gray-600">
        {row.getValue('count_ghosted')}
      </div>
    ),
  },
  {
    accessorKey: 'count_offer',
    header: 'Offers',
    cell: ({ row }) => (
      <div className="text-center font-mono text-green-600">
        {row.getValue('count_offer')}
      </div>
    ),
  },
]

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await fetch('/api/leaderboard')
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard')
  }
  return response.json()
}

export function LeaderboardTable() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'total_apps', desc: true }
  ])

  const { data: leaderboard = [], isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
  })

  const table = useReactTable({
    data: leaderboard,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Failed to load leaderboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No users on the leaderboard yet. Start applying and be the first!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} users
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}