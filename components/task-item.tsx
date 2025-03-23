"use client"

import type React from "react"

import { useState, useRef } from "react"
import type { Task, TagCategory } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Trash2, ChevronDown, ChevronUp, Calendar } from "lucide-react"
import { format, isBefore, isToday } from "date-fns"
import { useDrag, useDrop } from "react-dnd"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

interface TaskItemProps {
  task: Task
  index: number
  getTagName: (tagId: string) => string
  getTagCategory?: (tagId: string) => TagCategory | undefined
  onToggleComplete: (taskId: string) => void
  onEdit: () => void
  onDelete: () => void
  onMove: (dragIndex: number, hoverIndex: number) => void
  sortable: boolean
}

type DragItem = {
  index: number
  id: string
  type: string
}

export function TaskItem({
  task,
  index,
  getTagName,
  getTagCategory,
  onToggleComplete,
  onEdit,
  onDelete,
  onMove,
  sortable,
}: TaskItemProps) {
  const [expanded, setExpanded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  // Format date
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMM d, yyyy")
  }

  // Get due date status
  const getDueDateStatus = () => {
    if (!task.dueDate) return null

    const today = new Date()
    const dueDate = new Date(task.dueDate)

    if (isToday(dueDate)) return "today"
    if (isBefore(dueDate, today)) return "overdue"

    // Check if due within next 3 days
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(today.getDate() + 3)

    if (isBefore(dueDate, threeDaysFromNow)) return "upcoming"

    return "future"
  }

  // Get due date display
  const getDueDateDisplay = () => {
    if (!task.dueDate) return null

    const status = getDueDateStatus()
    const dateStr = format(new Date(task.dueDate), "MMM d, yyyy")

    let className = "text-xs flex items-center gap-1 "

    switch (status) {
      case "overdue":
        className += "text-destructive font-medium"
        break
      case "today":
        className += "text-orange-500 dark:text-orange-400 font-medium"
        break
      case "upcoming":
        className += "text-amber-600 dark:text-amber-500"
        break
      default:
        className += "text-muted-foreground"
    }

    return (
      <div className={className}>
        <Calendar className="h-3 w-3" />
        {status === "today" ? "Today" : dateStr}
      </div>
    )
  }

  // Group tags by category
  const getTagsByCategory = () => {
    if (!getTagCategory) return { other: task.tags }

    const grouped: Record<string, string[]> = {}

    task.tags.forEach((tagId) => {
      const category = getTagCategory(tagId)
      const categoryId = category?.id || "other"

      if (!grouped[categoryId]) {
        grouped[categoryId] = []
      }

      grouped[categoryId].push(tagId)
    })

    return grouped
  }

  // Set up drag and drop
  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { type: "TASK", id: task.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => sortable && !isMobile, // Disable dragging on mobile
  })

  const [, drop] = useDrop({
    accept: "TASK",
    hover(item: DragItem, monitor) {
      if (!ref.current || !sortable || isMobile) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      onMove(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  // For mobile, implement swipe to reveal actions
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && !isRevealed) {
      setIsRevealed(true)
    } else if (isRightSwipe && isRevealed) {
      setIsRevealed(false)
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  drag(drop(ref))

  // Group tags by category for display
  const tagsByCategory = getTagsByCategory()

  return (
    <div
      className={cn("relative overflow-hidden", isMobile && "touch-pan-y")}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      {/* Mobile action buttons (revealed on swipe) */}
      {isMobile && (
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex items-center transition-transform duration-300 ease-out",
            isRevealed ? "transform translate-x-0" : "transform translate-x-full",
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-12 w-12 bg-blue-500 text-white rounded-full m-1"
          >
            <Edit className="h-5 w-5" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-12 w-12 bg-red-500 text-white rounded-full m-1"
          >
            <Trash2 className="h-5 w-5" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      )}

      <Card
        ref={ref}
        className={cn(
          "transition-transform duration-300",
          task.completed ? "opacity-70" : "",
          isDragging ? "opacity-50" : "",
          sortable && !isMobile ? "cursor-move" : "",
          isMobile && isRevealed ? "transform -translate-x-24" : "",
        )}
      >
        <CardHeader className="p-4 pb-2 flex flex-row items-start">
          <div className="flex items-center space-x-2 flex-1">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={() => onToggleComplete(task.id)}
              className="touch-target"
            />
            <label
              htmlFor={`task-${task.id}`}
              className={`font-medium text-lg ${task.completed ? "line-through text-muted-foreground" : ""}`}
            >
              {task.title}
            </label>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-xs text-muted-foreground">{formatDate(task.createdAt)}</div>
            {getDueDateDisplay()}
          </div>
        </CardHeader>

        {task.description && (
          <CardContent className={`p-4 pt-0 pb-2 ${expanded ? "block" : "hidden"}`}>
            <p className={`text-sm ${task.completed ? "text-muted-foreground" : ""}`}>{task.description}</p>
          </CardContent>
        )}

        <CardFooter className="p-4 pt-2 flex flex-wrap justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {Object.entries(tagsByCategory).map(([categoryId, tagIds]) => (
              <div key={categoryId} className="flex flex-wrap gap-1">
                {tagIds.map((tagId) => {
                  const category = getTagCategory ? getTagCategory(tagId) : undefined
                  return (
                    <Badge
                      key={tagId}
                      variant="secondary"
                      className={category ? "border" : ""}
                      style={
                        category
                          ? {
                              backgroundColor: `${category.color}10`,
                              borderColor: category.color,
                            }
                          : {}
                      }
                    >
                      {getTagName(tagId)}
                    </Badge>
                  )
                })}
              </div>
            ))}
            {task.tags.length === 0 && <span className="text-xs text-muted-foreground">No tags</span>}
          </div>

          {!isMobile && (
            <div className="flex space-x-2">
              {task.description && (
                <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)} className="touch-target">
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="sr-only">{expanded ? "Collapse" : "Expand"}</span>
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onEdit} className="touch-target">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete} className="touch-target">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          )}

          {/* Mobile expand button */}
          {isMobile && task.description && (
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="touch-target">
              {expanded ? "Show less" : "Show more"}
              {expanded ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

