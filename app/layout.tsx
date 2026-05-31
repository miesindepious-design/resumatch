import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Resumatch — AI Resume Tailor',
  description: 'Tailor your resume to any job description in seconds using AI.',
  manifest: '/manifest.json',
  themeColor: '#d4622a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
