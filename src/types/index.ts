export type ApplicationStatus = 'applied' | 'interviewing' | 'rejected' | 'ghosted' | 'offer'

export type LocationKind = 'onsite' | 'remote'

export type SalaryType = 'hourly' | 'salary'

export interface Application {
  id: string
  user_id: string
  company: string
  job_title: string
  applied_at: string
  status: ApplicationStatus
  company_url: string
  salary_amount?: number | null
  salary_type?: SalaryType | null
  location_label?: string | null
  location_kind: LocationKind
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  username: string
  display_name?: string | null
  email: string
  email_verified_at?: string | null
  created_at: string
  updated_at: string
}

export interface ApplicationStats {
  total: number
  applied: number
  interviewing: number
  rejected: number
  ghosted: number
  offer: number
}

export interface LeaderboardEntry {
  user_id: string
  username: string
  display_name?: string | null
  total_apps: number
  count_applied: number
  count_interviewing: number
  count_rejected: number
  count_ghosted: number
  count_offer: number
  rank?: number
}

export interface ApplicationFilters {
  status?: ApplicationStatus[]
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}