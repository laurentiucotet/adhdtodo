"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export function DebugDatabase() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testDatabase = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const supabase = createClient()

      // Test 1: Check auth session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      // Test 2: Try to access the users table
      const { data: usersData, error: usersError } = await supabase.from("users").select("*").limit(1)

      // Test 3: Try to access the tasks table
      const { data: tasksData, error: tasksError } = await supabase.from("tasks").select("*").limit(1)

      setResults({
        session: {
          data: sessionData,
          error: sessionError ? sessionError.message : null,
        },
        users: {
          data: usersData,
          error: usersError ? usersError.message : null,
        },
        tasks: {
          data: tasksData,
          error: tasksError ? tasksError.message : null,
        },
      })
    } catch (err: any) {
      setError(err.message || "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Database Connection Debug</CardTitle>
        <CardDescription>Test your Supabase database connection</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={testDatabase} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            "Test Database Connection"
          )}
        </Button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            <h3 className="font-bold mb-2">Error:</h3>
            <p>{error}</p>
          </div>
        )}

        {results && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
            <h3 className="font-bold mb-2">Auth Session:</h3>
            <p>Session: {results.session.data.session ? "Active" : "None"}</p>
            {results.session.error && <p className="text-red-500">Error: {results.session.error}</p>}

            <h3 className="font-bold mt-4 mb-2">Users Table:</h3>
            {results.users.error ? (
              <p className="text-red-500">Error: {results.users.error}</p>
            ) : (
              <p>Found {results.users.data?.length || 0} users</p>
            )}

            <h3 className="font-bold mt-4 mb-2">Tasks Table:</h3>
            {results.tasks.error ? (
              <p className="text-red-500">Error: {results.tasks.error}</p>
            ) : (
              <p>Found {results.tasks.data?.length || 0} tasks</p>
            )}

            <div className="mt-4">
              <details>
                <summary className="cursor-pointer font-medium">View Raw Data</summary>
                <pre className="mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs overflow-auto">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          If you see database errors, check your Supabase setup and make sure the schema has been properly created.
        </p>
      </CardFooter>
    </Card>
  )
}

