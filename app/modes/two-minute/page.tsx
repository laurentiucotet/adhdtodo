"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Zap, Clock, ArrowLeft, CheckCircle2, ListChecks } from "lucide-react"
import Link from "next/link"
import type { Task, Tag } from "@/lib/types"
import { useMobile } from "@/hooks/use-mobile"

export default function TwoMinuteRulePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [quickTasks, setQuickTasks] = useState<Task[]>([])
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(0)
  const [isSessionComplete, setIsSessionComplete] = useState(false)
  const isMobile = useMobile()

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    const savedTags = localStorage.getItem("tags")

    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks)
      // Only include non-completed tasks
      const activeTasks = parsedTasks.filter((task: Task) => !task.completed)
      setTasks(activeTasks)

      // Filter for quick tasks (simulation - in a real app, you might have a "quick" flag or estimate)
      // For demo purposes, we'll assume tasks with short titles or descriptions are quick
      const quick = activeTasks.filter(
        (task: Task) => task.title.length < 30 && (!task.description || task.description.length < 50),
      )
      setQuickTasks(quick)
      setEstimatedTimeLeft(quick.length * 2) // 2 minutes per task
    }

    if (savedTags) {
      setTags(JSON.parse(savedTags))
    }
  }, [])

  // Get tag name by ID
  const getTagName = (tagId: string) => {
    const tag = tags.find((tag) => tag.id === tagId)
    return tag ? tag.name : tagId
  }

  // Handle task completion
  const completeTask = (taskId: string) => {
    // Update in local state
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, completed: true } : task)))

    // Update in localStorage
    const savedTasks = localStorage.getItem("tasks")
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks)
      const updatedTasks = parsedTasks.map((task: Task) => (task.id === taskId ? { ...task, completed: true } : task))
      localStorage.setItem("tasks", JSON.stringify(updatedTasks))
    }

    // Update completed count and move to next task
    setCompletedCount((prev) => prev + 1)

    if (currentTaskIndex < quickTasks.length - 1) {
      setCurrentTaskIndex((prev) => prev + 1)
      setEstimatedTimeLeft((prev) => prev - 2)
    } else {
      setIsSessionComplete(true)
    }
  }

  // Skip current task
  const skipTask = () => {
    if (currentTaskIndex < quickTasks.length - 1) {
      setCurrentTaskIndex((prev) => prev + 1)
      setEstimatedTimeLeft((prev) => prev - 2)
    } else {
      setIsSessionComplete(true)
    }
  }

  // Current task
  const currentTask = quickTasks[currentTaskIndex]

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/modes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Modes
          </Link>
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
            <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold">2-Minute Rule</h1>
        </div>
        <p className="text-muted-foreground">
          If a task takes less than 2 minutes to complete, do it immediately instead of scheduling it for later.
        </p>
      </div>

      {quickTasks.length === 0 ? (
        <Card className="border-green-200 dark:border-green-800 mb-8">
          <CardContent className="pt-6 text-center py-12">
            <div className="space-y-4">
              <p className="text-muted-foreground">No quick tasks available</p>
              <Button asChild variant="outline">
                <Link href="/tasks">Add some tasks</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : isSessionComplete ? (
        <Card className="border-green-200 dark:border-green-800 mb-8 bg-green-50 dark:bg-green-900/10">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400">Session Complete!</CardTitle>
            <CardDescription>You've processed all your quick tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold">Great job!</h2>
              <p>
                You completed {completedCount} out of {quickTasks.length} quick tasks.
              </p>
              <p className="text-sm text-muted-foreground">
                That's approximately {completedCount * 2} minutes of productivity!
              </p>
            </div>
          </CardContent>
          <CardFooter className={`${isMobile ? "flex-col space-y-3" : "flex justify-between"}`}>
            <Button variant="outline" asChild className={isMobile ? "w-full" : ""}>
              <Link href="/modes">Try Another Mode</Link>
            </Button>
            <Button asChild className={isMobile ? "w-full" : ""}>
              <Link href="/tasks">
                <ListChecks className="mr-2 h-4 w-4" />
                View All Tasks
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <Card className="border-green-200 dark:border-green-800 mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    Quick Task {currentTaskIndex + 1} of {quickTasks.length}
                  </CardTitle>
                  <CardDescription>Complete this task now if it takes less than 2 minutes</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">~{estimatedTimeLeft} min left</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Progress value={(currentTaskIndex / quickTasks.length) * 100} className="h-2" />
              </div>

              {currentTask && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`task-${currentTask.id}`}
                      checked={false}
                      onCheckedChange={() => completeTask(currentTask.id)}
                      className="mt-1"
                    />
                    <div>
                      <label htmlFor={`task-${currentTask.id}`} className="font-medium text-lg block mb-1">
                        {currentTask.title}
                      </label>
                      {currentTask.description && (
                        <p className="text-muted-foreground text-sm mb-3">{currentTask.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {currentTask.tags.map((tagId) => (
                          <Badge key={tagId} variant="secondary">
                            {getTagName(tagId)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className={`${isMobile ? "flex-col space-y-3" : "flex justify-between"}`}>
              <Button variant="outline" onClick={skipTask} className={isMobile ? "w-full" : ""}>
                Skip This Task
              </Button>
              <Button
                onClick={() => completeTask(currentTask.id)}
                className={`bg-green-600 hover:bg-green-700 ${isMobile ? "w-full" : ""}`}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Complete
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-green-100 dark:border-green-900 bg-green-50/50 dark:bg-green-900/20">
            <CardHeader>
              <CardTitle className="text-lg">About the 2-Minute Rule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                The 2-Minute Rule comes from David Allen's Getting Things Done (GTD) methodology. The principle is
                simple: if a task will take less than two minutes to complete, do it immediately instead of scheduling
                it for later.
              </p>
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">Why it works:</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Reduces the cognitive load of tracking small tasks</li>
                  <li>Prevents small tasks from piling up</li>
                  <li>Creates momentum and a sense of accomplishment</li>
                  <li>Often takes less time to do the task than to organize and track it</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  )
}

