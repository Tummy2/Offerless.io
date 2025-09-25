'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate, formatSalary, getStatusColor } from '@/lib/utils'
import type { Application } from '@/types'
import { ExternalLink, Search, Pencil, Trash2, Filter, SortAsc, SortDesc } from 'lucide-react'
import { useState } from 'react'
import { EditApplicationDialog } from './edit-application-dialog'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'

async function fetchApplications(params?: {
  search?: string
  status?: string[]
  locationKind?: string
  sortBy?: string
  sortOrder?: string
}): Promise<Application[]> {
  const searchParams = new URLSearchParams()
  
  if (params?.search) searchParams.append('q', params.search)
  if (params?.status?.length) searchParams.append('status', params.status.join(','))
  if (params?.locationKind && params.locationKind !== 'all') searchParams.append('locationKind', params.locationKind)
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder)
  
  const response = await fetch(`/api/applications?${searchParams.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch applications')
  }
  return response.json()
}

async function deleteApplication(id: string): Promise<void> {
  const response = await fetch(`/api/applications/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete application')
  }
}

export function ApplicationsTable() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [locationKindFilter, setLocationKindFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState('applied_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ['applications', { 
      search: searchTerm, 
      status: statusFilter, 
      locationKind: locationKindFilter,
      sortBy,
      sortOrder 
    }],
    queryFn: () => fetchApplications({
      search: searchTerm,
      status: statusFilter,
      locationKind: locationKindFilter,
      sortBy,
      sortOrder
    }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      toast({
        title: 'Success',
        description: 'Application deleted successfully!',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete application',
        variant: 'destructive',
      })
    },
  })

  const handleStatusFilterChange = (status: string, checked: boolean) => {
    setStatusFilter(prev => 
      checked 
        ? [...prev, status]
        : prev.filter(s => s !== status)
    )
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search applications..." className="pl-8" disabled />
          </div>
          <Button variant="outline" disabled>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Failed to load applications</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by company or job title..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Status {statusFilter.length > 0 && `(${statusFilter.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {['applied', 'interviewing', 'rejected', 'ghosted', 'offer'].map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilter.includes(status)}
                onCheckedChange={(checked) => handleStatusFilterChange(status, checked)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Location Kind Filter */}
        <Select value={locationKindFilter} onValueChange={setLocationKindFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="onsite">On-site</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {(statusFilter.length > 0 || (locationKindFilter && locationKindFilter !== 'all')) && (
          <Button 
            variant="ghost" 
            onClick={() => {
              setStatusFilter([])
              setLocationKindFilter('')
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('company')}
              >
                <div className="flex items-center">
                  Company {getSortIcon('company')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('job_title')}
              >
                <div className="flex items-center">
                  Job Title {getSortIcon('job_title')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('applied_at')}
              >
                <div className="flex items-center">
                  Applied Date {getSortIcon('applied_at')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length > 0 ? (
              applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">
                    {application.company}
                  </TableCell>
                  <TableCell>{application.job_title}</TableCell>
                  <TableCell>
                    {formatDate(application.applied_at)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {application.salary_amount && application.salary_type ? (
                      <span>{formatSalary(application.salary_amount, application.salary_type)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {application.location_label || (
                        application.location_kind === 'remote' ? 'Remote' : '—'
                      )}
                      {application.location_kind === 'remote' && (
                        <Badge variant="secondary" className="text-xs">
                          🌍
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingApplication(application)}
                        title="Edit application"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this application?')) {
                            deleteMutation.mutate(application.id)
                          }
                        }}
                        title="Delete application"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={application.company_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View job posting"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {searchTerm || statusFilter.length > 0 || locationKindFilter ? (
                    <div className="space-y-2">
                      <p>No applications found matching your filters.</p>
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSearchTerm('')
                          setStatusFilter([])
                          setLocationKindFilter('')
                        }}
                        className="h-auto p-0"
                      >
                        Clear all filters
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p>No applications found.</p>
                      <p className="text-sm text-muted-foreground">
                        Add your first application to get started!
                      </p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {applications.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {applications.length} application{applications.length !== 1 ? 's' : ''}
          </span>
          <span>
            Sorted by {sortBy.replace('_', ' ')} ({sortOrder === 'desc' ? 'newest first' : 'oldest first'})
          </span>
        </div>
      )}

      {editingApplication && (
        <EditApplicationDialog
          application={editingApplication}
          open={!!editingApplication}
          onOpenChange={(open) => !open && setEditingApplication(null)}
        />
      )}
    </div>
  )
}