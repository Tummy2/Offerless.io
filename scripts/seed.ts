import { createClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const companies = [
  'Google', 'Meta', 'Apple', 'Microsoft', 'Amazon', 'Netflix', 'Tesla', 'Stripe',
  'Airbnb', 'Uber', 'Spotify', 'Slack', 'Figma', 'Linear', 'Vercel', 'GitHub'
]

const jobTitles = [
  'Software Engineer', 'Senior Software Engineer', 'Frontend Developer',
  'Backend Developer', 'Full Stack Developer', 'DevOps Engineer',
  'Product Manager', 'Data Scientist', 'UI/UX Designer', 'Marketing Manager'
]

const statuses = ['applied', 'interviewing', 'rejected', 'ghosted', 'offer'] as const

async function createDemoUsers() {
  const users = []
  
  for (let i = 0; i < 10; i++) {
    const username = faker.internet.userName().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    const email = faker.internet.email()
    
    const { data: user, error } = await supabase.auth.admin.createUser({
      email,
      password: 'TempPass123!',
      email_confirm: true,
      user_metadata: {
        username: username.substring(0, 24),
        display_name: faker.person.fullName(),
      }
    })
    
    if (user) {
      users.push(user.user)
      console.log(`Created user: ${email}`)
    }
  }
  
  return users
}

async function createApplications(users: any[]) {
  for (const user of users) {
    const numApplications = faker.number.int({ min: 5, max: 50 })
    
    for (let i = 0; i < numApplications; i++) {
      const company = faker.helpers.arrayElement(companies)
      const jobTitle = faker.helpers.arrayElement(jobTitles)
      const status = faker.helpers.arrayElement(statuses)
      const appliedAt = faker.date.recent({ days: 120 })
      
      const application = {
        user_id: user.id,
        company,
        job_title: jobTitle,
        applied_at: appliedAt.toISOString().split('T')[0],
        status,
        company_url: `https://${company.toLowerCase().replace(' ', '')}.com/careers`,
        salary_amount: faker.datatype.boolean() ? faker.number.int({ min: 50000, max: 200000 }) : null,
        salary_type: faker.datatype.boolean() ? faker.helpers.arrayElement(['hourly', 'salary']) : null,
        location_label: faker.datatype.boolean() ? faker.location.city() + ', ' + faker.location.state() : null,
        location_kind: faker.helpers.arrayElement(['onsite', 'remote']),
      }
      
      await supabase.from('applications').insert(application)
    }
    
    console.log(`Created ${numApplications} applications for user ${user.email}`)
  }
}

async function refreshLeaderboard() {
  const { error } = await supabase.rpc('refresh_leaderboard_snapshots')
  if (error) {
    console.error('Error refreshing leaderboard:', error)
  } else {
    console.log('Leaderboard refreshed successfully')
  }
}

async function main() {
  console.log('🌱 Starting seed process...')
  
  try {
    console.log('👥 Creating demo users...')
    const users = await createDemoUsers()
    
    console.log('📝 Creating applications...')
    await createApplications(users)
    
    console.log('🏆 Refreshing leaderboard...')
    await refreshLeaderboard()
    
    console.log('✅ Seed process completed successfully!')
    console.log(`Created ${users.length} users with sample applications`)
  } catch (error) {
    console.error('❌ Seed process failed:', error)
    process.exit(1)
  }
}

main()