"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { db } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertTriangle } from "lucide-react"

export default function DataMigration() {
  const [hasLocalData, setHasLocalData] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationComplete, setMigrationComplete] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if there's data in localStorage
    const tasksJson = localStorage.getItem("tasks")
    const tagsJson = localStorage.getItem("tags")

    setHasLocalData(!!(tasksJson || tagsJson))
  }, [])

  const handleMigration = async () => {
    try {
      setIsMigrating(true)

      const success = await db.migration.migrateFromLocalStorage()

      if (success) {
        setMigrationComplete(true)
        toast({
          title: "Migration successful",
          description: "Your data has been migrated to the database.",
          variant: "default",
        })
      } else {
        toast({
          title: "No data to migrate",
          description: "There was no data found in localStorage to migrate.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error migrating data:", error)
      toast({
        title: "Migration failed",
        description: "There was an error migrating your data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMigrating(false)
    }
  }

  if (!hasLocalData || migrationComplete) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Data Migration Required
        </CardTitle>
        <CardDescription>
          We've detected that you have data stored locally. Would you like to migrate it to your account?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            This will transfer your tasks and tags from your browser's local storage to your account. After migration,
            your data will be available on any device you sign in to.
          </AlertDescription>
        </Alert>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setMigrationComplete(true)}>
            Skip
          </Button>
          <Button onClick={handleMigration} disabled={isMigrating}>
            {isMigrating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Migrating...
              </>
            ) : (
              "Migrate Data"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

