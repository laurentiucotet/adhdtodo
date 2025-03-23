"use client"

import { useState, useEffect } from "react"
import { TaskWheel } from "@/components/task-wheel"
import { SelectedTaskCard } from "@/components/selected-task-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shuffle, Filter } from "lucide-react"
import Link from "next/link"
import type { Task, Tag } from "@/lib/types"
import { useMobile } from "@/hooks/use-mobile"

export default function WheelPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
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
      setFilteredTasks(activeTasks)
    }

    if (savedTags) {
      setTags(JSON.parse(savedTags))
    }
  }, [])

  // Filter tasks based on selected tags
  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredTasks(tasks)
    } else {
      const filtered = tasks.filter((task) => selectedTags.some((tagId) => task.tags.includes(tagId)))
      setFilteredTasks(filtered)
    }
  }, [selectedTags, tasks])

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  // Start spinning the wheel
  const handleSpin = () => {
    if (filteredTasks.length === 0 || isSpinning) return

    setIsSpinning(true)
    setSelectedTask(null)

    // Simulate wheel spinning with a random duration
    const spinDuration = 2000 + Math.random() * 2000

    setTimeout(() => {
      // Randomly select a task
      const randomIndex = Math.floor(Math.random() * filteredTasks.length)
      setSelectedTask(filteredTasks[randomIndex])
      setIsSpinning(false)

      // Provide haptic feedback on mobile devices if supported
      if (isMobile && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(200)
      }
    }, spinDuration)
  }

  return (
    <main className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">Task Wheel</h1>
        <p className="text-muted-foreground">
          Spin the wheel to randomly select a task from your list. Can't decide what to work on next? Let the wheel
          decide!
        </p>
      </div>

      {/* Filter Section */}
      <Card className="mb-8 border-blue-100 dark:border-blue-900">
        <CardHeader className={isMobile ? "p-4" : ""}>
          <CardTitle className="flex items-center text-xl">
            <Filter className="mr-2 h-5 w-5 text-blue-500" />
            Filter Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "px-4 pb-4 pt-0" : ""}>
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                className="cursor-pointer touch-target py-1"
                onClick={() => toggleTag(tag.id)}
              >
                {tag.name}
              </Badge>
            ))}
            {tags.length === 0 && <p className="text-sm text-muted-foreground">No tags available</p>}
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{filteredTasks.length} tasks available for selection</p>
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTags([])}
                className="text-blue-500 touch-target"
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className={isMobile ? "space-y-8" : "grid md:grid-cols-2 gap-8"}>
        {/* Wheel Section */}
        <div className="flex flex-col items-center">
          <div className="mb-6 w-full max-w-md">
            <TaskWheel tasks={filteredTasks} isSpinning={isSpinning} />
          </div>

          <Button
            onClick={handleSpin}
            disabled={isSpinning || filteredTasks.length === 0}
            size="lg"
            className="mt-4 touch-target py-6 px-8"
          >
            <Shuffle className="mr-2 h-5 w-5" />
            {isSpinning ? "Spinning..." : "Spin the Wheel"}
          </Button>
        </div>

        {/* Selected Task Section */}
        <div>
          {selectedTask ? (
            <SelectedTaskCard task={selectedTask} tags={tags} onSpinAgain={handleSpin} />
          ) : (
            <Card className="h-full flex items-center justify-center border-dashed border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
              <CardContent className="text-center py-12">
                {filteredTasks.length === 0 ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">No tasks available to select</p>
                    <Button asChild variant="outline" className="touch-target">
                      <Link href="/tasks">Add some tasks</Link>
                    </Button>
                  </div>
                ) : isSpinning ? (
                  <p className="text-blue-600 dark:text-blue-400 text-xl animate-pulse">Selecting a random task...</p>
                ) : (
                  <p className="text-muted-foreground">Spin the wheel to select a random task</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}

