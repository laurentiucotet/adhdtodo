"use client"

import { useState } from "react"
import type { Task, Tag } from "@/lib/database"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Calendar, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

interface TaskListProps {
  tasks: Task[]
  tags: Tag[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string, isCompleted: boolean) => void
}

export default function TaskList({ tasks, tags, onEdit, onDelete, onToggleComplete }: TaskListProps) {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true
    if (filter === "active") return !task.is_completed
    if (filter === "completed") return task.is_completed
    return true
  })

  const getTagsForTask = (taskId: string): Tag[] => {
    // This is a placeholder. In a real implementation, you would fetch the tags for each task
    // from the database or pass them as props
    return []
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-blue-100 text-blue-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "urgent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isDueSoon = (dueDate: string | null | undefined) => {
    if (!dueDate) return false
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 2
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
          All
        </Button>
        <Button variant={filter === "active" ? "default" : "outline"} onClick={() => setFilter("active")}>
          Active
        </Button>
        <Button variant={filter === "completed" ? "default" : "outline"} onClick={() => setFilter("completed")}>
          Completed
        </Button>
      </div>

      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-gray-500 mb-2">No tasks found</p>
            <p className="text-sm text-gray-400">
              {filter === "all"
                ? "Add a new task to get started"
                : filter === "active"
                  ? "No active tasks"
                  : "No completed tasks"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className={task.is_completed ? "opacity-70" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.is_completed}
                    onCheckedChange={(checked) => onToggleComplete(task.id, checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className={`font-medium ${task.is_completed ? "line-through text-gray-500" : ""}`}>
                        {task.title}
                      </h3>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(task)} className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(task.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}

                    <div className="flex flex-wrap gap-2 mt-2">
                      {task.due_date && (
                        <div className="flex items-center text-xs text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>
                            {format(new Date(task.due_date), "MMM d, yyyy")}
                            {isDueSoon(task.due_date) && (
                              <span className="ml-1 text-red-500 flex items-center">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Due soon
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>

                      {getTagsForTask(task.id).map((tag) => (
                        <Badge key={tag.id} style={{ backgroundColor: tag.color, color: "#fff" }}>
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

