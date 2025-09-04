import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM dd, yyyy')
}

export function formatRelativeDate(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatSalary(amount: number, type: 'hourly' | 'salary') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  
  const suffix = type === 'hourly' ? '/hr' : '/yr'
  return `${formatter.format(amount)}${suffix}`
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'applied':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'interviewing':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'ghosted':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    case 'offer':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'applied':
      return '📝'
    case 'interviewing':
      return '🗣️'
    case 'rejected':
      return '❌'
    case 'ghosted':
      return '👻'
    case 'offer':
      return '🎉'
    default:
      return '📄'
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function generateUsername(email: string): string {
  const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  const randomSuffix = Math.random().toString(36).substring(2, 6)
  return `${baseUsername}_${randomSuffix}`.substring(0, 24)
}

export function parseCSV(csvContent: string): Record<string, string>[] {
  const lines = csvContent.trim().split('\n')
  if (lines.length === 0) return []
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const rows: Record<string, string>[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    if (values.length === headers.length) {
      const row: Record<string, string> = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      rows.push(row)
    }
  }
  
  return rows
}

export function generateCSV(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    }).join(',')
  )
  
  return [csvHeaders, ...csvRows].join('\n')
}

// US Cities and States for location autocomplete
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
]

export const US_MAJOR_CITIES = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
  'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
  'Boston, MA', 'El Paso, TX', 'Nashville, TN', 'Detroit, MI', 'Oklahoma City, OK',
  'Portland, OR', 'Las Vegas, NV', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD',
  'Milwaukee, WI', 'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA',
  'Mesa, AZ', 'Kansas City, MO', 'Atlanta, GA', 'Long Beach, CA', 'Colorado Springs, CO',
  'Raleigh, NC', 'Miami, FL', 'Virginia Beach, VA', 'Omaha, NE', 'Oakland, CA',
  'Minneapolis, MN', 'Tulsa, OK', 'Arlington, TX', 'Tampa, FL', 'New Orleans, LA',
  'Wichita, KS', 'Cleveland, OH', 'Bakersfield, CA', 'Aurora, CO', 'Anaheim, CA',
  'Honolulu, HI', 'Santa Ana, CA', 'Riverside, CA', 'Corpus Christi, TX', 'Lexington, KY',
  'Stockton, CA', 'Henderson, NV', 'Saint Paul, MN', 'St. Louis, MO', 'Cincinnati, OH',
  'Pittsburgh, PA', 'Greensboro, NC', 'Anchorage, AK', 'Plano, TX', 'Lincoln, NE',
  'Orlando, FL', 'Irvine, CA', 'Newark, NJ', 'Toledo, OH', 'Durham, NC',
  'Chula Vista, CA', 'Fort Wayne, IN', 'Jersey City, NJ', 'St. Petersburg, FL',
  'Laredo, TX', 'Madison, WI', 'Chandler, AZ', 'Buffalo, NY', 'Lubbock, TX',
  'Scottsdale, AZ', 'Reno, NV', 'Glendale, AZ', 'Gilbert, AZ', 'Winston-Salem, NC',
  'North Las Vegas, NV', 'Norfolk, VA', 'Chesapeake, VA', 'Garland, TX', 'Irving, TX',
  'Hialeah, FL', 'Fremont, CA', 'Boise, ID', 'Richmond, VA', 'Baton Rouge, LA',
  'Spokane, WA', 'Des Moines, IA', 'Modesto, CA', 'Fayetteville, NC', 'Tacoma, WA',
  'Oxnard, CA', 'Fontana, CA', 'Columbus, GA', 'Montgomery, AL', 'Moreno Valley, CA',
  'Shreveport, LA', 'Aurora, IL', 'Yonkers, NY', 'Akron, OH', 'Huntington Beach, CA',
  'Little Rock, AR', 'Augusta, GA', 'Amarillo, TX', 'Glendale, CA', 'Mobile, AL',
  'Grand Rapids, MI', 'Salt Lake City, UT', 'Tallahassee, FL', 'Huntsville, AL',
  'Grand Prairie, TX', 'Knoxville, TN', 'Worcester, MA', 'Newport News, VA',
  'Brownsville, TX', 'Overland Park, KS', 'Santa Clarita, CA', 'Providence, RI',
  'Garden Grove, CA', 'Chattanooga, TN', 'Oceanside, CA', 'Jackson, MS',
  'Fort Lauderdale, FL', 'Santa Rosa, CA', 'Rancho Cucamonga, CA', 'Port St. Lucie, FL',
  'Tempe, AZ', 'Ontario, CA', 'Vancouver, WA', 'Cape Coral, FL', 'Sioux Falls, SD',
  'Springfield, MO', 'Peoria, AZ', 'Pembroke Pines, FL', 'Elk Grove, CA',
  'Salem, OR', 'Lancaster, CA', 'Corona, CA', 'Eugene, OR', 'Palmdale, CA',
  'Salinas, CA', 'Springfield, MA', 'Pasadena, CA', 'Fort Collins, CO', 'Hayward, CA',
  'Pomona, CA', 'Cary, NC', 'Rockford, IL', 'Alexandria, VA', 'Escondido, CA',
  'McKinney, TX', 'Kansas City, KS', 'Joliet, IL', 'Sunnyvale, CA', 'Torrance, CA',
  'Bridgeport, CT', 'Lakewood, CO', 'Hollywood, FL', 'Paterson, NJ', 'Naperville, IL',
  'Syracuse, NY', 'Mesquite, TX', 'Dayton, OH', 'Savannah, GA', 'Clarksville, TN',
  'Orange, CA', 'Pasadena, TX', 'Fullerton, CA', 'Killeen, TX', 'Frisco, TX',
  'Hampton, VA', 'McAllen, TX', 'Warren, MI', 'Bellevue, WA', 'West Valley City, UT',
  'Columbia, MO', 'Olathe, KS', 'Sterling Heights, MI', 'New Haven, CT', 'Miramar, FL',
  'Waco, TX', 'Thousand Oaks, CA', 'Cedar Rapids, IA', 'Charleston, SC', 'Visalia, CA',
  'Topeka, KS', 'Elizabeth, NJ', 'Gainesville, FL', 'Thornton, CO', 'Roseville, CA',
  'Carrollton, TX', 'Coral Springs, FL', 'Stamford, CT', 'Simi Valley, CA',
  'Concord, CA', 'Hartford, CT', 'Kent, WA', 'Lafayette, LA', 'Midland, TX',
  'Surprise, AZ', 'Denton, TX', 'Victorville, CA', 'Evansville, IN', 'Santa Clara, CA',
  'Abilene, TX', 'Athens, GA', 'Vallejo, CA', 'Allentown, PA', 'Norman, OK',
  'Beaumont, TX', 'Independence, MO', 'Murfreesboro, TN', 'Ann Arbor, MI',
  'Fargo, ND', 'Wilmington, NC', 'Golden, CO', 'Columbia, SC', 'Carmel, IN',
  'Elgin, IL', 'Bartlett, TN', 'Provo, UT', 'Miami Gardens, FL', 'College Station, TX'
]

export const LOCATION_SUGGESTIONS = [...US_MAJOR_CITIES, ...US_STATES, 'Remote']