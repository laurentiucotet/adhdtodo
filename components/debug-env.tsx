"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugEnv() {
  const [showEnv, setShowEnv] = useState(false)

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Environment Debug</CardTitle>
        <CardDescription>Check if environment variables are loaded correctly</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setShowEnv(!showEnv)}>
          {showEnv ? "Hide Environment Info" : "Show Environment Info"}
        </Button>

        {showEnv && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
            <h3 className="font-bold mb-2">Environment Variables:</h3>
            <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set"}</p>
            <p>
              NEXT_PUBLIC_SUPABASE_ANON_KEY:{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set (hidden for security)" : "Not set"}
            </p>

            <h3 className="font-bold mt-4 mb-2">Browser Environment:</h3>
            <p>Window Location: {typeof window !== "undefined" ? window.location.href : "Server rendering"}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          If environment variables are not set, make sure your .env.local file is in the root directory and restart the
          development server.
        </p>
      </CardFooter>
    </Card>
  )
}

