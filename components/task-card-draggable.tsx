"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Calendar, ChevronDown, ChevronUp } from "lucide-react"
import type { Task } from "@/lib/types"
import { useDrag } from "react-dnd"
import { cn } from "@/lib/utils"

interface TaskCardDraggableProps {
  task: Task
  getTagName: (tagId: string) => string
  onComplete: () => void
}

export function TaskCardDraggable({ task, getTagName, onComplete }: TaskCardDraggableProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

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

  return (
    <Card
      ref={drag}
      className={cn("cursor-move border transition-all hover:shadow-md", isDragging ? "opacity-50" : "opacity-100")}
    >
      {/* Accordion Header - Always visible */}
      <div
        className="p-3 flex justify-between items-start"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`task-content-${task.id}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setIsExpanded(!isExpanded)
          }
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm truncate">{task.title}</h3>
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Always show due date if available */}
          {task.dueDate && (
            <span className="text-xs text-muted-foreground flex items-center mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>

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
      </div>

      {/* Accordion Content - Only visible when expanded */}
      {isExpanded && (
        <div id={`task-content-${task.id}`} className="px-3 pb-3 pt-0 border-t border-border/40">
          {task.description && <p className="text-xs text-muted-foreground mt-2 mb-3">{task.description}</p>}

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground mr-1">Tags:</span>
              {task.tags.map((tagId) => (
                <Badge key={tagId} variant="secondary" className="text-xs">
                  {getTagName(tagId)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

