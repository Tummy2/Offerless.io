import { z } from 'zod'

// Application validation schema
export const applicationSchema = z.object({
  company: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(80, 'Company name must be less than 80 characters'),
  job_title: z.string()
    .min(2, 'Job title must be at least 2 characters')
    .max(80, 'Job title must be less than 80 characters'),
  applied_at: z.date()
    .max(new Date(), 'Application date cannot be in the future'),
  status: z.enum(['applied', 'interviewing', 'rejected', 'ghosted', 'offer'], {
    required_error: 'Status is required',
  }),
  company_url: z.string()
    .url('Must be a valid URL')
    .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
      message: 'URL must start with http:// or https://',
    }),
  salary_amount: z.number()
    .positive('Salary must be positive')
    .optional()
    .nullable(),
  salary_type: z.enum(['hourly', 'salary']).optional().nullable(),
  location_label: z.string()
    .max(120, 'Location must be less than 120 characters')
    .optional()
    .nullable(),
  location_kind: z.enum(['onsite', 'remote']).default('onsite'),
})
.refine((data) => {
  // If salary_type is provided, salary_amount must also be provided
  if (data.salary_type && !data.salary_amount) {
    return false
  }
  // If salary_amount is provided, salary_type must also be provided
  if (data.salary_amount && !data.salary_type) {
    return false
  }
  return true
}, {
  message: 'Both salary amount and type must be provided together',
  path: ['salary_amount'],
})

export type ApplicationInput = z.infer<typeof applicationSchema>

// Profile validation schema
export const profileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(24, 'Username must be less than 24 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  display_name: z.string()
    .max(50, 'Display name must be less than 50 characters')
    .optional()
    .nullable(),
})

export type ProfileInput = z.infer<typeof profileSchema>

// Authentication validation schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(24, 'Username must be less than 24 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  display_name: z.string()
    .max(50, 'Display name must be less than 50 characters')
    .optional(),
})

export type SignUpInput = z.infer<typeof signUpSchema>

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type SignInInput = z.infer<typeof signInSchema>

// Filters validation
export const applicationFiltersSchema = z.object({
  status: z.array(z.enum(['applied', 'interviewing', 'rejected', 'ghosted', 'offer'])).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(),
})

export type ApplicationFiltersInput = z.infer<typeof applicationFiltersSchema>

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
})

export type PaginationInput = z.infer<typeof paginationSchema>

// Sort validation
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type SortInput = z.infer<typeof sortSchema>

// CSV import validation
export const csvRowSchema = z.object({
  company: z.string().min(1),
  job_title: z.string().min(1),
  applied_at: z.string().transform((str) => new Date(str)),
  status: z.enum(['applied', 'interviewing', 'rejected', 'ghosted', 'offer']),
  company_url: z.string().url(),
  salary_amount: z.string().transform((str) => str ? parseFloat(str) : undefined).optional(),
  salary_type: z.enum(['hourly', 'salary']).optional(),
  location_label: z.string().optional(),
  location_kind: z.enum(['onsite', 'remote']).default('onsite'),
})

export type CsvRowInput = z.infer<typeof csvRowSchema>