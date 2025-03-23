"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, ArrowLeft, Clock, AlertTriangle, CheckCircle2, Trash2, Info } from "lucide-react"
import Link from "next/link"
import type { Task, Tag } from "@/lib/types"
import { useMobile } from "@/hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { cn } from "@/lib/utils"

type Quadrant = "urgent-important" | "not-urgent-important" | "urgent-not-important" | "not-urgent-not-important"

// Draggable Task Card Component
interface TaskCardProps {
  task: Task
  getTagName: (tagId: string) => string
  onComplete: () => void
}

function TaskCard({ task, getTagName, onComplete }: TaskCardProps) {
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
      className={`p-3 bg-white dark:bg-gray-800 rounded-lg border shadow-sm cursor-move hover:shadow-md transition-shadow ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-sm">{task.title}</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onComplete}>
          <span className="sr-only">Complete task</span>
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      </div>
      {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.map((tagId) => (
            <Badge key={tagId} variant="secondary" className="text-xs">
              {getTagName(tagId)}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// Droppable Quadrant Component
interface QuadrantProps {
  quadrant: Quadrant
  title: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  tasks: Task[]
  onMoveTask: (taskId: string, quadrant: Quadrant) => void
  onCompleteTask: (taskId: string) => void
  getTagName: (tagId: string) => string
}

function Quadrant({
  quadrant,
  title,
  description,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  tasks,
  onMoveTask,
  onCompleteTask,
  getTagName,
}: QuadrantProps) {
  const [isOver, setIsOver] = useState(false)

  // Set up drop target
  const [{ isOverCurrent }, drop] = useDrop({
    accept: "TASK",
    drop: (item: { id: string }) => {
      onMoveTask(item.id, quadrant)
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
      className={cn("border-2 transition-all", isOver ? borderColor : "border-transparent", isOver ? bgColor : "")}
    >
      <CardHeader className={`${bgColor} rounded-t-xl border-b ${borderColor}`}>
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${color}`} />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[200px] overflow-y-auto pt-4">
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} getTagName={getTagName} onComplete={() => onCompleteTask(task.id)} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[150px] border-2 border-dashed rounded-lg text-muted-foreground text-sm">
            Drag tasks here
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function EisenhowerMatrixPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [quadrants, setQuadrants] = useState<Record<Quadrant, Task[]>>({
    "urgent-important": [],
    "not-urgent-important": [],
    "urgent-not-important": [],
    "not-urgent-not-important": [],
  })
  const [taskQuadrants, setTaskQuadrants] = useState<Record<string, Quadrant>>({}) // taskId -> quadrant
  const [unassignedTasks, setUnassignedTasks] = useState<Task[]>([])
  const isMobile = useMobile()

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    const savedTags = localStorage.getItem("tags")
    const savedTaskQuadrants = localStorage.getItem("eisenhowerTaskQuadrants")

    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks)
      // Only include non-completed tasks
      const activeTasks = parsedTasks.filter((task: Task) => !task.completed)
      setTasks(activeTasks)
    }

    if (savedTags) {
      setTags(JSON.parse(savedTags))
    }

    if (savedTaskQuadrants) {
      setTaskQuadrants(JSON.parse(savedTaskQuadrants))
    }
  }, [])

  // Save task quadrants to localStorage when they change
  useEffect(() => {
    localStorage.setItem("eisenhowerTaskQuadrants", JSON.stringify(taskQuadrants))
  }, [taskQuadrants])

  // Update quadrants and unassigned tasks when tasks or taskQuadrants change
  useEffect(() => {
    const matrix: Record<Quadrant, Task[]> = {
      "urgent-important": [],
      "not-urgent-important": [],
      "urgent-not-important": [],
      "not-urgent-not-important": [],
    }

    const unassigned: Task[] = []

    tasks.forEach((task) => {
      const quadrant = taskQuadrants[task.id]
      if (quadrant) {
        matrix[quadrant].push(task)
      } else {
        unassigned.push(task)
      }
    })

    setQuadrants(matrix)
    setUnassignedTasks(unassigned)
  }, [tasks, taskQuadrants])

  // Get tag name by ID
  const getTagName = (tagId: string) => {
    const tag = tags.find((tag) => tag.id === tagId)
    return tag ? tag.name : tagId
  }

  // Handle moving a task to a quadrant
  const moveTaskToQuadrant = (taskId: string, quadrant: Quadrant) => {
    setTaskQuadrants((prev) => ({
      ...prev,
      [taskId]: quadrant,
    }))

    // Update task tags based on quadrant
    updateTaskTags(taskId, quadrant)
  }

  // Update task tags based on quadrant
  const updateTaskTags = (taskId: string, quadrant: Quadrant) => {
    const savedTasks = localStorage.getItem("tasks")
    if (!savedTasks) return

    const parsedTasks = JSON.parse(savedTasks)
    const taskIndex = parsedTasks.findIndex((t: Task) => t.id === taskId)

    if (taskIndex === -1) return

    const task = parsedTasks[taskIndex]

    // Define quadrant-specific tags
    const quadrantTags: Record<Quadrant, string[]> = {
      "urgent-important": ["urgent", "important"],
      "not-urgent-important": ["important"],
      "urgent-not-important": ["urgent"],
      "not-urgent-not-important": [],
    }

    // Get tag IDs for the quadrant-specific tags
    const tagIdsToAdd: string[] = []

    quadrantTags[quadrant].forEach((tagName) => {
      const tag = tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase())
      if (tag) {
        tagIdsToAdd.push(tag.id)
      }
    })

    // Remove existing urgency and importance tags
    const tagsToRemove = ["urgent", "important"]
    const tagIdsToRemove = tags.filter((tag) => tagsToRemove.includes(tag.name.toLowerCase())).map((tag) => tag.id)

    const nonQuadrantTags = task.tags.filter((tagId) => !tagIdsToRemove.includes(tagId))

    // Add new quadrant-specific tags
    const updatedTags = [...new Set([...nonQuadrantTags, ...tagIdsToAdd])]

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

    // Remove from task quadrants
    const updatedTaskQuadrants = { ...taskQuadrants }
    delete updatedTaskQuadrants[taskId]
    setTaskQuadrants(updatedTaskQuadrants)
  }

  // Dummy functions for task item component
  const dummyEdit = () => {}
  const dummyDelete = () => {}
  const dummyMove = () => {}

  // Get quadrant display info
  const getQuadrantInfo = (quadrant: Quadrant) => {
    switch (quadrant) {
      case "urgent-important":
        return {
          title: "Do First",
          description: "Urgent and important tasks that need immediate attention",
          icon: AlertTriangle,
          color: "text-red-500",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
        }
      case "not-urgent-important":
        return {
          title: "Schedule",
          description: "Important but not urgent tasks to plan and prioritize",
          icon: Clock,
          color: "text-blue-500",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
        }
      case "urgent-not-important":
        return {
          title: "Delegate",
          description: "Urgent but less important tasks to delegate if possible",
          icon: CheckCircle2,
          color: "text-amber-500",
          bgColor: "bg-amber-50 dark:bg-amber-900/20",
          borderColor: "border-amber-200 dark:border-amber-800",
        }
      case "not-urgent-not-important":
        return {
          title: "Eliminate",
          description: "Neither urgent nor important tasks to reconsider or eliminate",
          icon: Trash2,
          color: "text-gray-500",
          bgColor: "bg-gray-50 dark:bg-gray-800/20",
          borderColor: "border-gray-200 dark:border-gray-700",
        }
    }
  }

  // Determine the backend based on device
  const Backend = isMobile ? TouchBackend : HTML5Backend

  return (
    <DndProvider backend={Backend}>
      <main className="container mx-auto p-4 max-w-5xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/modes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Modes
            </Link>
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
              <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold">Eisenhower Matrix</h1>
          </div>
          <p className="text-muted-foreground">
            Prioritize tasks based on their urgency and importance to focus on what matters most.
          </p>
        </div>

        {isMobile ? (
          // Mobile view - tabs for each quadrant
          <Tabs defaultValue="urgent-important" className="w-full mb-8">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="urgent-important">Do First ({quadrants["urgent-important"].length})</TabsTrigger>
              <TabsTrigger value="not-urgent-important">
                Schedule ({quadrants["not-urgent-important"].length})
              </TabsTrigger>
              <TabsTrigger value="urgent-not-important">
                Delegate ({quadrants["urgent-not-important"].length})
              </TabsTrigger>
              <TabsTrigger value="not-urgent-not-important">
                Eliminate ({quadrants["not-urgent-not-important"].length})
              </TabsTrigger>
              <TabsTrigger value="unassigned">Unassigned ({unassignedTasks.length})</TabsTrigger>
            </TabsList>

            {Object.entries(quadrants).map(([key, tasks]) => {
              const quadrant = key as Quadrant
              const info = getQuadrantInfo(quadrant)

              return (
                <TabsContent key={key} value={quadrant} className="mt-0">
                  <Quadrant
                    quadrant={quadrant}
                    title={info.title}
                    description={info.description}
                    icon={info.icon}
                    color={info.color}
                    bgColor={info.bgColor}
                    borderColor={info.borderColor}
                    tasks={tasks}
                    onMoveTask={moveTaskToQuadrant}
                    onCompleteTask={completeTask}
                    getTagName={getTagName}
                  />
                </TabsContent>
              )
            })}

            <TabsContent value="unassigned" className="mt-0">
              <Card className="mb-4">
                <CardHeader className="bg-purple-50 dark:bg-purple-900/20 rounded-t-xl border-b border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-purple-500" />
                    <CardTitle className="text-lg">Unassigned Tasks</CardTitle>
                  </div>
                  <CardDescription>Drag these tasks to categorize them in the matrix</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {unassignedTasks.length > 0 ? (
                    <div className="space-y-3">
                      {unassignedTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          getTagName={getTagName}
                          onComplete={() => completeTask(task.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No unassigned tasks</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // Desktop view - grid layout
          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(quadrants).map(([key, tasks]) => {
                const quadrant = key as Quadrant
                const info = getQuadrantInfo(quadrant)

                return (
                  <Quadrant
                    key={quadrant}
                    quadrant={quadrant}
                    title={info.title}
                    description={info.description}
                    icon={info.icon}
                    color={info.color}
                    bgColor={info.bgColor}
                    borderColor={info.borderColor}
                    tasks={tasks}
                    onMoveTask={moveTaskToQuadrant}
                    onCompleteTask={completeTask}
                    getTagName={getTagName}
                  />
                )
              })}
            </div>

            <Card className="mb-4">
              <CardHeader className="bg-purple-50 dark:bg-purple-900/20 rounded-t-xl border-b border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-lg">Unassigned Tasks</CardTitle>
                </div>
                <CardDescription>Drag these tasks to categorize them in the matrix</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {unassignedTasks.length > 0 ? (
                  <div className="space-y-3">
                    {unassignedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        getTagName={getTagName}
                        onComplete={() => completeTask(task.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No unassigned tasks</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="border-purple-100 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-900/20">
          <CardHeader>
            <CardTitle className="text-lg">About the Eisenhower Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              The Eisenhower Matrix, named after President Dwight D. Eisenhower, is a productivity tool that helps you
              prioritize tasks by urgency and importance.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="font-medium">The four quadrants:</h4>
                <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
                  <li>
                    <span className="font-medium text-red-600 dark:text-red-400">Do First:</span> Urgent and important
                    tasks that require immediate attention
                  </li>
                  <li>
                    <span className="font-medium text-blue-600 dark:text-blue-400">Schedule:</span> Important but not
                    urgent tasks that you should plan time for
                  </li>
                  <li>
                    <span className="font-medium text-amber-600 dark:text-amber-400">Delegate:</span> Urgent but less
                    important tasks that you should delegate if possible
                  </li>
                  <li>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Eliminate:</span> Neither urgent nor
                    important tasks that you should reconsider or eliminate
                  </li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                "What is important is seldom urgent and what is urgent is seldom important." — Dwight D. Eisenhower
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </DndProvider>
  )
}

