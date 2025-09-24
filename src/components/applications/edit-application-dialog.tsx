'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { applicationSchema, type ApplicationInput } from '@/lib/validations'
import type { Application } from '@/types'
import { LocationSearchInput } from './location-search-input'

interface EditApplicationDialogProps {
  application: Application
  open: boolean
  onOpenChange: (open: boolean) => void
}

async function updateApplication(id: string, data: ApplicationInput) {
  const response = await fetch(`/api/applications/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      company: data.company,
      job_title: data.job_title,
      applied_at: data.applied_at.toISOString().split('T')[0],
      status: data.status,
      company_url: data.company_url,
      salary_amount: data.salary_amount || null,
      salary_type: data.salary_type || null,
      location_label: data.location_label || null,
      location_kind: data.location_kind,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update application')
  }

  return response.json()
}

export function EditApplicationDialog({
  application,
  open,
  onOpenChange,
}: EditApplicationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
  })

  // Populate form with existing application data
  useEffect(() => {
    if (application && open) {
      reset({
        company: application.company,
        job_title: application.job_title,
        applied_at: new Date(application.applied_at),
        status: application.status,
        company_url: application.company_url,
        salary_amount: application.salary_amount || undefined,
        salary_type: application.salary_type || undefined,
        location_label: application.location_label || undefined,
        location_kind: application.location_kind,
      })
    }
  }, [application, open, reset])

  const mutation = useMutation({
    mutationFn: (data: ApplicationInput) => updateApplication(application.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      toast({
        title: 'Success',
        description: 'Application updated successfully!',
      })
      onOpenChange(false)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = async (data: ApplicationInput) => {
    setIsSubmitting(true)
    try {
      if (!data.status) {
        toast({
          title: 'Error', 
          description: 'Please select a status',
          variant: 'destructive',
        })
        return
      }
      
      await mutation.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const salaryType = watch('salary_type')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
          <DialogDescription>
            Update your job application information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                placeholder="e.g. Google"
                {...register('company')}
                disabled={isSubmitting}
              />
              {errors.company && (
                <p className="text-sm text-red-500">{errors.company.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title *</Label>
              <Input
                id="job_title"
                placeholder="e.g. Software Engineer"
                {...register('job_title')}
                disabled={isSubmitting}
              />
              {errors.job_title && (
                <p className="text-sm text-red-500">{errors.job_title.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_url">Company URL *</Label>
            <Input
              id="company_url"
              type="url"
              placeholder="https://company.com/careers/job-id"
              {...register('company_url')}
              disabled={isSubmitting}
            />
            {errors.company_url && (
              <p className="text-sm text-red-500">{errors.company_url.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applied_at">Application Date *</Label>
              <Input
                id="applied_at"
                type="date"
                {...register('applied_at', { valueAsDate: true })}
                disabled={isSubmitting}
              />
              {errors.applied_at && (
                <p className="text-sm text-red-500">{errors.applied_at.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">📝 Applied</SelectItem>
                  <SelectItem value="interviewing">🗣️ Interviewing</SelectItem>
                  <SelectItem value="rejected">❌ Rejected</SelectItem>
                  <SelectItem value="ghosted">👻 Ghosted</SelectItem>
                  <SelectItem value="offer">🎉 Offer</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location_kind">Location Type</Label>
              <Select
                value={watch('location_kind')}
                onValueChange={(value) => setValue('location_kind', value as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onsite">🏢 On-site</SelectItem>
                  <SelectItem value="remote">🌍 Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_label">Location</Label>
              <LocationSearchInput
                value={watch('location_label') || ''}
                onChange={(value) => setValue('location_label', value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_type">Salary Type</Label>
              <Select
                value={watch('salary_type') || ''}
                onValueChange={(value) => setValue('salary_type', value as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="hourly">💰 Hourly</SelectItem>
                  <SelectItem value="salary">💼 Annual Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_amount">
                Amount {salaryType ? '*' : ''}
              </Label>
              <Input
                id="salary_amount"
                type="number"
                placeholder={salaryType === 'hourly' ? '25' : '75000'}
                {...register('salary_amount', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.salary_amount && (
                <p className="text-sm text-red-500">{errors.salary_amount.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}