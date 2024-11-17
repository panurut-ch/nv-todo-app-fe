'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}