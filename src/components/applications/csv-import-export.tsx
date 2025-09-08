'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Download, Upload } from 'lucide-react'
import { parseCSV, generateCSV } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'

export function CsvImportExport() {
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/applications?all=true')
      const applications = await response.json()
      
      const csvData = generateCSV(applications, [
        'company', 'job_title', 'applied_at', 'status', 'company_url',
        'salary_amount', 'salary_type', 'location_label', 'location_kind'
      ])
      
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'Success',
        description: 'Applications exported successfully!',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export applications',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      
      // Import each row
      const promises = rows.map(row => 
        fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row),
        })
      )
      
      await Promise.all(promises)
      
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      
      toast({
        title: 'Success',
        description: `Imported ${rows.length} applications!`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import applications',
        variant: 'destructive',
      })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={isExporting}
      >
        <Download className="mr-2 h-4 w-4" />
        {isExporting ? 'Exporting...' : 'Export CSV'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
      >
        <Upload className="mr-2 h-4 w-4" />
        {isImporting ? 'Importing...' : 'Import CSV'}
      </Button>
      
      <Input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  )
}