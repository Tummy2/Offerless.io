import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Offerless - Job Application Tracker',
  description: 'Track your job applications, compete on the leaderboard, and gamify your job search journey.',
  keywords: ['job search', 'application tracker', 'career', 'leaderboard', 'gamification'],
  authors: [{ name: 'Offerless' }],
  openGraph: {
    title: 'Offerless - Job Application Tracker',
    description: 'Track your job applications, compete on the leaderboard, and gamify your job search journey.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}