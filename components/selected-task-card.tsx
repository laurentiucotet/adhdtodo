"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Shuffle, Edit, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import type { Task, Tag } from "@/lib/types"
import { useMobile } from "@/hooks/use-mobile"

interface SelectedTaskCardProps {
  task: Task
  tags: Tag[]
  onSpinAgain: () => void
}

export function SelectedTaskCard({ task, tags, onSpinAgain }: SelectedTaskCardProps) {
  const isMobile = useMobile()

  // Get tag name by ID
  const getTagName = (tagId: string) => {
    const tag = tags.find((tag) => tag.id === tagId)
    return tag ? tag.name : tagId
  }

  // Format date
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMM d, yyyy")
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800 shadow-md">
      <CardHeader
        className={`bg-blue-50 dark:bg-blue-900/30 rounded-t-xl border-b border-blue-100 dark:border-blue-800 ${isMobile ? "p-4" : ""}`}
      >
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl text-blue-700 dark:text-blue-300">Selected Task</CardTitle>
          <div className="text-xs text-muted-foreground">Created on {formatDate(task.createdAt)}</div>
        </div>
      </CardHeader>

      <CardContent className={`pt-6 space-y-4 ${isMobile ? "px-4" : ""}`}>
        <h3 className="text-2xl font-bold">{task.title}</h3>

        {task.description && <p className="text-muted-foreground">{task.description}</p>}

        <div className="flex flex-wrap gap-2">
          {task.tags.map((tagId) => (
            <Badge key={tagId} variant="secondary">
              {getTagName(tagId)}
            </Badge>
          ))}
          {task.tags.length === 0 && <span className="text-xs text-muted-foreground">No tags</span>}
        </div>

        {task.dueDate && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            Due: {format(new Date(task.dueDate), "PPP")}
          </div>
        )}
      </CardContent>

      <CardFooter
        className={`flex ${isMobile ? "flex-col space-y-3" : "justify-between"} border-t border-blue-100 dark:border-blue-800 pt-4 ${isMobile ? "px-4 pb-4" : ""}`}
      >
        <Button
          variant="outline"
          onClick={onSpinAgain}
          className={`border-blue-200 dark:border-blue-800 touch-target ${isMobile ? "w-full" : ""}`}
        >
          <Shuffle className="mr-2 h-4 w-4" />
          Spin Again
        </Button>

        <div className={`flex gap-2 ${isMobile ? "w-full" : ""}`}>
          <Button asChild variant="outline" className={`touch-target ${isMobile ? "flex-1" : ""}`}>
            <Link href={`/tasks?edit=${task.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Task
            </Link>
          </Button>

          <Button asChild className={`touch-target ${isMobile ? "flex-1" : ""}`}>
            <Link href="/tasks">
              <CheckCircle className="mr-2 h-4 w-4" />
              View Tasks
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

