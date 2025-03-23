"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"
import type { Task } from "@/lib/types"
import { useDrag } from "react-dnd"
import { cn } from "@/lib/utils"
import { useTasks } from "@/providers/tasks-provider"

interface TaskCardProps {
  task: Task
  getTagName: (tagId: string) => string
  onComplete: () => void
}

export function TaskCard({ task, getTagName, onComplete }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const { tags } = useTasks()

  // Format due date if exists
  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null

    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const getUrgencyTags = () => {
    const urgencyOrder = ["asap", "urgent", "soon", "later"]
    const urgencyTags = task.tags
      .map((tagId) => {
        const tag = tags?.find((t) => t.id === tagId)
        return tag ? { id: tagId, name: tag.name.toLowerCase() } : null
      })
      .filter((tag) => tag && urgencyOrder.includes(tag.name))
      .sort((a, b) => {
        if (!a || !b) return 0
        return urgencyOrder.indexOf(a.name) - urgencyOrder.indexOf(b.name)
      })

    return urgencyTags
  }

  const getNonUrgencyTags = () => {
    const urgencyNames = ["asap", "urgent", "soon", "later"]
    return task.tags.filter((tagId) => {
      const tag = tags?.find((t) => t.id === tagId)
      return tag && !urgencyNames.includes(tag.name.toLowerCase())
    })
  }

  return (
    <Card
      ref={drag}
      className={cn("cursor-move border transition-all hover:shadow-md", isDragging ? "opacity-50" : "opacity-100")}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <Button
            variant="outline"
            size="sm"
            className="mt-1 h-6 w-6 rounded-full p-0 shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onComplete()
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="sr-only">Complete</span>
          </Button>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm line-clamp-2">{task.title}</h3>

            {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}

            <div className="flex flex-wrap items-center gap-1 mt-2">
              {task.dueDate && (
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {formatDueDate(task.dueDate)}
                </span>
              )}

              {getUrgencyTags()
                .slice(0, 1)
                .map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className={cn(
                      "text-xs font-semibold",
                      tag.name === "asap" && "bg-red-100 text-red-800 border-red-200",
                      tag.name === "urgent" && "bg-orange-100 text-orange-800 border-orange-200",
                      tag.name === "soon" && "bg-yellow-100 text-yellow-800 border-yellow-200",
                      tag.name === "later" && "bg-blue-100 text-blue-800 border-blue-200",
                    )}
                  >
                    {getTagName(tag.id)}
                  </Badge>
                ))}

              {getNonUrgencyTags()
                .slice(0, 1)
                .map((tagId) => (
                  <Badge key={tagId} variant="secondary" className="text-xs">
                    {getTagName(tagId)}
                  </Badge>
                ))}

              {task.tags.length > getUrgencyTags().length + 1 && (
                <Badge variant="outline" className="text-xs">
                  +{task.tags.length - (getUrgencyTags().length + 1)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

