# Rejected.gg - Gamified Job Application Tracker

📊 A production-ready MVP for tracking job applications with gamification elements, built with Next.js 14, Supabase, and TypeScript.

## Features

- **Authentication**: Email/password and Google OAuth with Supabase Auth
- **Job Applications**: Full CRUD with advanced filtering, sorting, and pagination
- **Dashboard**: Real-time statistics and interactive data tables
- **Leaderboard**: Gamified competition with verified email requirement
- **Responsive Design**: Mobile-first approach with dark/light theme support
- **CSV Import/Export**: Bulk operations for application data
- **Real-time Updates**: Live data synchronization across users
- **Type-safe**: Full TypeScript coverage with Zod validation

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes with Supabase
- **Database**: PostgreSQL (Supabase) with Row Level Security
- **Authentication**: Supabase Auth with email verification
- **State Management**: TanStack Query for server state
- **Testing**: Vitest + React Testing Library
- **Deployment**: Optimized for Vercel

## Prerequisites

- Node.js 18+ (LTS recommended)
- Supabase CLI (`npm install -g supabase`)
- Vercel account (for deployment)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd rejected-gg
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.local.example .env.local
```

### 3. Supabase Setup

#### Option A: Local Development (Recommended for getting started)

```bash
# Start local Supabase
supabase start

# Apply database migrations
supabase db reset

# Generate TypeScript types
npm run supabase:gen-types
```

#### Option B: Supabase Cloud Project

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run migrations on your cloud database:

```bash
supabase db push
```

### 4. Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `your_supabase_url/auth/v1/callback`
5. In Supabase Dashboard:
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Client ID and Client Secret
6. Update `supabase/config.toml` for local development:

```toml
[auth.external.google]
enabled = true
client_id = "your_google_client_id"
secret = "your_google_client_secret"
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Schema

### Tables

- **profiles**: User profiles with username and display name
- **applications**: Job applications with status tracking
- **leaderboard_snapshots**: Materialized leaderboard data

### Key Features

- Row Level Security (RLS) enabled
- Email verification requirement for leaderboard
- Automatic profile creation on signup
- URL validation for company links
- Salary amount/type consistency checks

## Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:reset        # Reset local database
npm run db:seed         # Seed with demo data
npm run supabase:gen-types  # Generate TypeScript types

# Testing
npm run test            # Run tests
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run tests with coverage

# Code Quality
npm run lint            # Lint code
npm run type-check      # TypeScript type checking
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel domain)

3. Deploy:

```bash
vercel --prod
```

### Environment Variables

#### Required

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-only)
- `NEXT_PUBLIC_APP_URL`: Your app's URL (for OAuth callbacks)

#### Optional

- Google OAuth credentials (configured in Supabase dashboard)

## Development Workflow

### Adding New Features

1. **Database Changes**: Create migration in `supabase/migrations/`
2. **Types**: Run `npm run supabase:gen-types` after schema changes
3. **Validation**: Add Zod schemas in `src/lib/validations.ts`
4. **API Routes**: Create in `src/app/api/`
5. **Components**: Build reusable components in `src/components/`
6. **Pages**: Add pages in `src/app/`
7. **Tests**: Write tests in `src/test/`

### Data Seeding

Create demo data:

```bash
npm run db:seed
```

This creates:
- 10 demo users with verified emails
- ~300 applications with realistic data distribution
- Refreshed leaderboard snapshots

### CSV Import/Export

The app supports CSV import/export with these columns:
- `company`, `job_title`, `applied_at`, `status`, `company_url`
- `salary_amount`, `salary_type`, `location_label`, `location_kind`

## API Endpoints

### Authentication
- `POST /api/auth/signout` - Sign out user

### Applications
- `GET /api/applications` - List applications (paginated, filtered)
- `POST /api/applications` - Create application
- `PATCH /api/applications/[id]` - Update application
- `DELETE /api/applications/[id]` - Delete application

### User Data
- `GET /api/me/stats` - Get user statistics
- `GET /api/me/profile` - Get user profile
- `PATCH /api/me/profile` - Update user profile

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard (paginated, sorted)

## Security Features

- Row Level Security (RLS) on all tables
- Server-side validation with Zod
- CSRF protection via Supabase session verification
- Rate limiting on API routes
- Input sanitization and URL validation

## Testing

Run the test suite:

```bash
npm run test
```

Key test areas:
- Schema validation
- Authentication flows
- RLS policy enforcement
- Component rendering
- API endpoint behavior

## Troubleshooting

### Common Issues

1. **Supabase Connection Errors**
   - Verify environment variables
   - Check if local Supabase is running (`supabase status`)
   - Ensure migrations are applied

2. **Authentication Issues**
   - Check OAuth configuration in Supabase dashboard
   - Verify redirect URLs match your domain
   - Ensure email verification is enabled

3. **Database Errors**
   - Run `supabase db reset` to reset local database
   - Check RLS policies are properly configured
   - Verify user has proper permissions

4. **Build Errors**
   - Run `npm run type-check` to identify TypeScript issues
   - Ensure all dependencies are installed
   - Check that environment variables are properly set

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review [Next.js 14 Documentation](https://nextjs.org/docs)
- Open an issue on the repository

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run linting and type checking
6. Submit a pull request

## License

MIT License - see LICENSE file for details
