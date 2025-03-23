"use client"

import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const { user, signOut, isLoading } = useAuth()
  const pathname = usePathname()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Todo App
        </Link>

        <nav className="flex items-center gap-4">
          {!isLoading && (
            <>
              {user ? (
                <>
                  <Link href="/tasks" className={`text-sm ${pathname === "/tasks" ? "font-medium" : ""}`}>
                    Tasks
                  </Link>
                  <Link href="/settings" className={`text-sm ${pathname === "/settings" ? "font-medium" : ""}`}>
                    Settings
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => signOut()}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className={`text-sm ${pathname === "/login" ? "font-medium" : ""}`}>
                    Login
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

