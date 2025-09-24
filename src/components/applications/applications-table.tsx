'use client'

import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { ExternalLink, Search } from 'lucide-react'
import { useState } from 'react'

async function fetchApplications(): Promise<Application[]> {
  const response = await fetch('/api/applications')
  if (!response.ok) {
    throw new Error('Failed to fetch applications')
  }
  return response.json()
}

export function ApplicationsTable() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ['applications'],
    queryFn: fetchApplications,
  })

  const filteredApplications = applications.filter(app => 
    app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search applications..." className="pl-8" disabled />
          </div>
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
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search applications..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
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
                    {application.location_label || (
                      application.location_kind === 'remote' ? 'Remote' : '—'
                    )}
                    {application.location_kind === 'remote' && application.location_label && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        Remote
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {searchTerm ? (
                    <div className="space-y-2">
                      <p>No applications found matching "{searchTerm}"</p>
                      <Button 
                        variant="link" 
                        onClick={() => setSearchTerm('')}
                        className="h-auto p-0"
                      >
                        Clear search
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

      {filteredApplications.length > 0 && (
        <div className="flex items-center justify-end text-sm text-muted-foreground">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>
      )}
    </div>
  )
}