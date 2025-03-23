import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import Navbar from "@/components/navbar" // Updated import path

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Todo App",
  description: "A simple todo app built with Next.js and Supabase",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8">{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'