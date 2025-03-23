"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, CalendarClock, Edit, Trash2, MoreHorizontal, CheckCircle2, Calendar } from "lucide-react"
import Link from "next/link"
import type { Task, Tag } from "@/lib/types"
import { useMobile } from "@/hooks/use-mobile"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { findMatchingDateRangeTags, createDefaultUrgencyTags } from "@/lib/date-utils"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

export interface TimeCategory {
  id: string
  name: string
  color: string
  description: string
  order: number
}

// TaskCard component for draggable tasks
interface TaskCardProps {
  task: Task
  getTagName: (tagId: string) => string
  onComplete: () => void
  tags?: Tag[] // Add this line
}

// Update the TaskCard function to accept tags
function TaskCard({ task, getTagName, onComplete, tags = [] }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Add the helper functions for urgency tags
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

  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return (
    <div
      ref={drag}
      className={`bg-white dark:bg-gray-800 rounded-lg border shadow-sm cursor-move hover:shadow-md transition-shadow ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
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

          {/* Always show the first urgency tag */}
          <div className="flex flex-wrap gap-1 mt-1">
            {getUrgencyTags()
              .slice(0, 1)
              .map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold",
                    tag.name === "asap" &&
                      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
                    tag.name === "urgent" &&
                      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
                    tag.name === "soon" &&
                      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
                    tag.name === "later" &&
                      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
                  )}
                >
                  {getTagName(tag.id)}
                </Badge>
              ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            onComplete()
          }}
        >
          <span className="sr-only">Complete task</span>
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Accordion Content - Only visible when expanded */}
      {isExpanded && (
        <div id={`task-content-${task.id}`} className="px-3 pb-3 pt-0 border-t border-border/40">
          {task.description && <p className="text-sm text-muted-foreground mt-2 mb-3">{task.description}</p>}

          <div className="flex flex-col gap-2">
            {task.dueDate && (
              <div className="text-xs text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}

            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground mr-1">Tags:</span>
                {/* Show all tags when expanded */}
                {getUrgencyTags().map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className={cn(
                      "text-xs font-semibold",
                      tag.name === "asap" &&
                        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
                      tag.name === "urgent" &&
                        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
                      tag.name === "soon" &&
                        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
                      tag.name === "later" &&
                        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
                    )}
                  >
                    {getTagName(tag.id)}
                  </Badge>
                ))}

                {getNonUrgencyTags().map((tagId) => (
                  <Badge key={tagId} variant="secondary" className="text-xs">
                    {getTagName(tagId)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// TimeCategory component for category containers
interface TimeCategoryProps {
  category: TimeCategory
  tasks: Task[]
  onMoveTask: (taskId: string, categoryId: string) => void
  onCompleteTask: (taskId: string) => void
  getTagName: (tagId: string) => string
  onEdit: () => void
  onDelete: () => void
}

// Update the TimeCategory component to pass tags to TaskCard
function TimeCategory({
  category,
  tasks,
  onMoveTask,
  onCompleteTask,
  getTagName,
  onEdit,
  onDelete,
  tags = [], // Add this parameter
}: TimeCategoryProps & { tags?: Tag[] }) {
  // Update the type
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

  // Update the TaskCard usage in the return statement
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
              <TaskCard
                key={task.id}
                task={task}
                getTagName={getTagName}
                onComplete={() => onCompleteTask(task.id)}
                tags={tags} // Add this line
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

export default function TimeSortPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [categories, setCategories] = useState<TimeCategory[]>([])
  const [taskCategories, setTaskCategories] = useState<Record<string, string>>({}) // taskId -> categoryId
  const [isEditingCategory, setIsEditingCategory] = useState<TimeCategory | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#3B82F6") // Default blue
  const [newCategoryDescription, setNewCategoryDescription] = useState("")
  const [categoryToDelete, setCategoryToDelete] = useState<TimeCategory | null>(null)
  const isMobile = useMobile()

  // Default categories
  const defaultCategories: TimeCategory[] = [
    {
      id: "asap",
      name: "ASAP",
      color: "#EF4444", // red-500
      description: "Tasks that need immediate attention",
      order: 0,
    },
    {
      id: "this-week",
      name: "This Week",
      color: "#F59E0B", // amber-500
      description: "Tasks to complete within the current week",
      order: 1,
    },
    {
      id: "next-month",
      name: "Next Month",
      color: "#3B82F6", // blue-500
      description: "Tasks planned for the upcoming month",
      order: 2,
    },
    {
      id: "someday",
      name: "Someday",
      color: "#6B7280", // gray-500
      description: "Tasks without a specific timeline",
      order: 3,
    },
  ]

  const ensureUrgencyTags = (existingTags: Tag[]): Tag[] => {
    const defaultTags = createDefaultUrgencyTags()
    const updatedTags = [...existingTags]

    // Check if each default tag exists, add if it doesn't
    defaultTags.forEach((defaultTag) => {
      const tagExists = existingTags.some((tag) => tag.name.toLowerCase() === defaultTag.name.toLowerCase())

      if (!tagExists) {
        updatedTags.push(defaultTag)
      }
    })

    return updatedTags
  }

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    const savedTags = localStorage.getItem("tags")
    const savedCategories = localStorage.getItem("timeCategories")
    const savedTaskCategories = localStorage.getItem("taskTimeCategories")

    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks)
      // Only include non-completed tasks
      const activeTasks = parsedTasks.filter((task: Task) => !task.completed)
      setTasks(activeTasks)
    }

    if (savedTags) {
      let parsedTags = JSON.parse(savedTags)
      // Ensure urgency tags exist
      parsedTags = ensureUrgencyTags(parsedTags)
      setTags(parsedTags)
      // Save the updated tags back to localStorage
      localStorage.setItem("tags", JSON.stringify(parsedTags))
    } else {
      // If no tags exist, create the default urgency tags
      const defaultTags = createDefaultUrgencyTags()
      setTags(defaultTags)
      localStorage.setItem("tags", JSON.stringify(defaultTags))
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories))
    } else {
      // Use default categories if none exist
      setCategories(defaultCategories)
      localStorage.setItem("timeCategories", JSON.stringify(defaultCategories))
    }

    if (savedTaskCategories) {
      setTaskCategories(JSON.parse(savedTaskCategories))
    }
  }, [])

  // Save categories to localStorage when they change
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem("timeCategories", JSON.stringify(categories))
    }
  }, [categories])

  // Save task categories to localStorage when they change
  useEffect(() => {
    localStorage.setItem("taskTimeCategories", JSON.stringify(taskCategories))
  }, [taskCategories])

  // Get tag name by ID
  const getTagName = (tagId: string) => {
    const tag = tags.find((tag) => tag.id === tagId)
    return tag ? tag.name : tagId
  }

  const applyUrgencyTags = (taskId: string, dueDate: string | null) => {
    if (!dueDate) return

    // Get the current task
    const savedTasks = localStorage.getItem("tasks")
    if (!savedTasks) return

    const parsedTasks = JSON.parse(savedTasks)
    const taskIndex = parsedTasks.findIndex((t: Task) => t.id === taskId)

    if (taskIndex === -1) return

    // Find matching date range tags
    const matchingTagIds = findMatchingDateRangeTags(dueDate, tags)

    if (matchingTagIds.length === 0) return

    // Update the task's tags
    const task = parsedTasks[taskIndex]

    // Remove any existing urgency tags
    const urgencyTagNames = ["asap", "urgent", "soon", "later"]
    const urgencyTagIds = tags.filter((tag) => urgencyTagNames.includes(tag.name.toLowerCase())).map((tag) => tag.id)

    const nonUrgencyTags = task.tags.filter((tagId) => !urgencyTagIds.includes(tagId))

    // Add the new urgency tags
    const updatedTags = [...nonUrgencyTags, ...matchingTagIds]

    // Update the task
    parsedTasks[taskIndex] = {
      ...task,
      tags: updatedTags,
    }

    // Save back to localStorage
    localStorage.setItem("tasks", JSON.stringify(parsedTasks))

    // Update the tasks state
    setTasks((prevTasks) => prevTasks.map((t) => (t.id === taskId ? { ...t, tags: updatedTags } : t)))
  }

  // Handle moving a task to a category
  const moveTaskToCategory = (taskId: string, categoryId: string) => {
    setTaskCategories((prev) => ({
      ...prev,
      [taskId]: categoryId,
    }))

    // Find the task
    const task = tasks.find((t) => t.id === taskId)
    if (task && task.dueDate) {
      // Apply urgency tags based on due date
      applyUrgencyTags(taskId, task.dueDate)
    }
  }

  // Get tasks for a specific category
  const getTasksForCategory = (categoryId: string) => {
    return tasks.filter((task) => taskCategories[task.id] === categoryId)
  }

  // Get uncategorized tasks
  const getUncategorizedTasks = () => {
    return tasks.filter((task) => !taskCategories[task.id])
  }

  // Add a new category
  const addCategory = () => {
    if (!newCategoryName.trim()) return

    const newCategory: TimeCategory = {
      id: `category-${Date.now()}`,
      name: newCategoryName,
      color: newCategoryColor,
      description: newCategoryDescription || `Tasks categorized as ${newCategoryName}`,
      order: categories.length,
    }

    setCategories((prev) => [...prev, newCategory])
    setNewCategoryName("")
    setNewCategoryColor("#3B82F6")
    setNewCategoryDescription("")
  }

  // Update an existing category
  const updateCategory = () => {
    if (!isEditingCategory || !newCategoryName.trim()) return

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === isEditingCategory.id
          ? {
              ...cat,
              name: newCategoryName,
              color: newCategoryColor,
              description: newCategoryDescription || cat.description,
            }
          : cat,
      ),
    )

    setIsEditingCategory(null)
    setNewCategoryName("")
    setNewCategoryColor("#3B82F6")
    setNewCategoryDescription("")
  }

  // Delete a category
  const deleteCategory = () => {
    if (!categoryToDelete) return

    // Remove the category
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryToDelete.id))

    // Remove task associations with this category
    const updatedTaskCategories = { ...taskCategories }
    Object.keys(updatedTaskCategories).forEach((taskId) => {
      if (updatedTaskCategories[taskId] === categoryToDelete.id) {
        delete updatedTaskCategories[taskId]
      }
    })
    setTaskCategories(updatedTaskCategories)

    setCategoryToDelete(null)
  }

  // Start editing a category
  const startEditingCategory = (category: TimeCategory) => {
    setIsEditingCategory(category)
    setNewCategoryName(category.name)
    setNewCategoryColor(category.color)
    setNewCategoryDescription(category.description)
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

    // Remove from task categories
    const updatedTaskCategories = { ...taskCategories }
    delete updatedTaskCategories[taskId]
    setTaskCategories(updatedTaskCategories)
  }

  // Determine the backend based on device
  const Backend = isMobile ? TouchBackend : HTML5Backend

  // Sort categories by order
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order)

  useEffect(() => {
    // Apply urgency tags to all tasks with due dates
    tasks.forEach((task) => {
      if (task.dueDate) {
        applyUrgencyTags(task.id, task.dueDate)
      }
    })
  }, [tags]) // Only re-run when tags change

  return (
    <DndProvider backend={Backend}>
      <main className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/modes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Modes
            </Link>
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
              <CalendarClock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold">Time-Based Card Sorting</h1>
          </div>
          <p className="text-muted-foreground">
            Organize your tasks into time-based categories by dragging and dropping them.
          </p>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Time Categories</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>Add a new time-based category for organizing your tasks.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="category-name" className="text-sm font-medium">
                    Category Name
                  </label>
                  <Input
                    id="category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Next Quarter"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="category-color" className="text-sm font-medium">
                    Category Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="category-color"
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <div className="w-10 h-10 rounded-full" style={{ backgroundColor: newCategoryColor }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="category-description" className="text-sm font-medium">
                    Description (Optional)
                  </label>
                  <Input
                    id="category-description"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Describe this category"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addCategory} disabled={!newCategoryName.trim()}>
                  Create Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        // Update the TimeCategory usage in the grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {sortedCategories.map((category) => (
            <TimeCategory
              key={category.id}
              category={category}
              tasks={getTasksForCategory(category.id)}
              onMoveTask={moveTaskToCategory}
              onCompleteTask={completeTask}
              getTagName={getTagName}
              onEdit={() => startEditingCategory(category)}
              onDelete={() => setCategoryToDelete(category)}
              tags={tags} // Add this line
            />
          ))}
        </div>
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Uncategorized Tasks</CardTitle>
              <Badge variant="outline" className="ml-2">
                {getUncategorizedTasks().length} tasks
              </Badge>
            </div>
            <CardDescription>
              Drag these tasks to categorize them based on when you plan to complete them
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              // Update the TaskCard usage in the uncategorized tasks section
              {getUncategorizedTasks().length > 0 ? (
                getUncategorizedTasks().map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    getTagName={getTagName}
                    onComplete={() => completeTask(task.id)}
                    tags={tags} // Add this line
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No uncategorized tasks. All tasks have been sorted!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-lg">About Time-Based Card Sorting</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Time-based card sorting helps you organize tasks according to when you plan to complete them. This
              approach provides clarity on your short and long-term commitments, helping you prioritize effectively.
            </p>
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">How to use this mode:</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Drag tasks from the "Uncategorized Tasks" section to the appropriate time category</li>
                <li>Create custom categories that match your planning horizons</li>
                <li>Rearrange tasks between categories as your plans change</li>
                <li>Mark tasks as complete when you finish them</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              This method works well with time blocking and calendar-based planning approaches.
            </p>
          </CardContent>
        </Card>
        {/* Edit Category Dialog */}
        {isEditingCategory && (
          <Dialog open={!!isEditingCategory} onOpenChange={(open) => !open && setIsEditingCategory(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>Update the details for this time category.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="edit-category-name" className="text-sm font-medium">
                    Category Name
                  </label>
                  <Input
                    id="edit-category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-category-color" className="text-sm font-medium">
                    Category Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="edit-category-color"
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <div className="w-10 h-10 rounded-full" style={{ backgroundColor: newCategoryColor }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-category-description" className="text-sm font-medium">
                    Description
                  </label>
                  <Input
                    id="edit-category-description"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditingCategory(null)}>
                  Cancel
                </Button>
                <Button onClick={updateCategory} disabled={!newCategoryName.trim()}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {/* Delete Category Confirmation */}
        <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete the "{categoryToDelete?.name}" category and remove all task associations with it. Tasks
                will be moved back to the uncategorized section.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteCategory} className="bg-red-500 hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </DndProvider>
  )
}

