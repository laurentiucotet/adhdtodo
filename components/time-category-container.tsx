"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, MoreHorizontal } from "lucide-react"
import type { Task, TimeCategory } from "@/lib/types"
import { useDrop } from "react-dnd"
import { TaskCardDraggable } from "./task-card-draggable"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TimeCategoryContainerProps {
  category: TimeCategory
  tasks: Task[]
  onMoveTask: (taskId: string, categoryId: string) => void
  onCompleteTask: (taskId: string) => void
  getTagName: (tagId: string) => string
  onEdit: () => void
  onDelete: () => void
}

export function TimeCategoryContainer({
  category,
  tasks,
  onMoveTask,
  onCompleteTask,
  getTagName,
  onEdit,
  onDelete,
}: TimeCategoryContainerProps) {
  const [isOver, setIsOver] = useState(false)

  // Set up drop target
  const [{ isOverCurrent }, drop] = useDrop({
    accept: "TASK",
    drop: (item: { id: string }) => {
      onMoveTask(item.id, category.id)
      return { moved: true }
    },
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
    hover: () => {
      setIsOver(true)
    },
    canDrop: () => true,
  })

  // Update hover state
  if (isOverCurrent !== isOver) {
    setIsOver(isOverCurrent)
  }

  return (
    <Card
      ref={drop}
      className="border-2 transition-all"
      style={{
        borderColor: isOver ? category.color : "transparent",
        backgroundColor: isOver ? `${category.color}10` : undefined,
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
            <CardTitle className="text-base">{category.name}</CardTitle>
            <Badge variant="outline" className="ml-1">
              {tasks.length}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Category options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
      </CardHeader>
      <CardContent className="min-h-[200px]">
        <div className="space-y-3">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCardDraggable
                key={task.id}
                task={task}
                getTagName={getTagName}
                onComplete={() => onCompleteTask(task.id)}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-[150px] border-2 border-dashed rounded-lg text-muted-foreground text-sm">
              Drag tasks here
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

