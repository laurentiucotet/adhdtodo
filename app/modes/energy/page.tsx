"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Battery, ArrowLeft, BatteryLow, BatteryMedium, BatteryFull, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import type { Task, Tag } from "@/lib/types"
import { useMobile } from "@/hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

type EnergyLevel = "high" | "medium" | "low"

export default function EnergyLevelsPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [energyTasks, setEnergyTasks] = useState<Record<EnergyLevel, Task[]>>({
    high: [],
    medium: [],
    low: [],
  })
  const [currentEnergyLevel, setCurrentEnergyLevel] = useState<EnergyLevel>("medium")
  const [sliderValue, setSliderValue] = useState(50)
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

      // Categorize tasks by energy level required
      // This is a simulation - in a real app, you'd have explicit energy level fields
      const energyMap: Record<EnergyLevel, Task[]> = {
        high: [],
        medium: [],
        low: [],
      }

      activeTasks.forEach((task: Task) => {
        // For demo purposes, we'll use task complexity to determine energy level
        const hasComplexDescription = task.description && task.description.length > 100
        const hasMultipleTags = task.tags.length > 2
        const hasLongTitle = task.title.length > 40

        if (hasComplexDescription || hasLongTitle) {
          energyMap.high.push(task)
        } else if (hasMultipleTags || task.description) {
          energyMap.medium.push(task)
        } else {
          energyMap.low.push(task)
        }
      })

      setEnergyTasks(energyMap)
    }

    if (savedTags) {
      setTags(JSON.parse(savedTags))
    }
  }, [])

  // Update energy level based on slider
  useEffect(() => {
    if (sliderValue < 33) {
      setCurrentEnergyLevel("low")
    } else if (sliderValue < 66) {
      setCurrentEnergyLevel("medium")
    } else {
      setCurrentEnergyLevel("high")
    }
  }, [sliderValue])

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

    // Remove from energy levels
    setEnergyTasks((prev) => {
      const updated = { ...prev }
      for (const key in updated) {
        updated[key as EnergyLevel] = updated[key as EnergyLevel].filter((task) => task.id !== taskId)
      }
      return updated
    })
  }

  // Get energy level display info
  const getEnergyLevelInfo = (level: EnergyLevel) => {
    switch (level) {
      case "high":
        return {
          title: "High Energy",
          description: "Tasks that require focus, creativity, or complex thinking",
          icon: BatteryFull,
          color: "text-green-500",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
        }
      case "medium":
        return {
          title: "Medium Energy",
          description: "Tasks that require moderate focus and engagement",
          icon: BatteryMedium,
          color: "text-blue-500",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
        }
      case "low":
        return {
          title: "Low Energy",
          description: "Simple tasks that can be done when tired or distracted",
          icon: BatteryLow,
          color: "text-amber-500",
          bgColor: "bg-amber-50 dark:bg-amber-900/20",
          borderColor: "border-amber-200 dark:border-amber-800",
        }
    }
  }

  // Get energy icon based on slider value
  const getEnergyIcon = () => {
    if (sliderValue < 33) {
      return <BatteryLow className="h-6 w-6 text-amber-500" />
    } else if (sliderValue < 66) {
      return <BatteryMedium className="h-6 w-6 text-blue-500" />
    } else {
      return <BatteryFull className="h-6 w-6 text-green-500" />
    }
  }

  return (
    <main className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/modes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Modes
          </Link>
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
            <Battery className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold">Energy Level Matching</h1>
        </div>
        <p className="text-muted-foreground">
          Match tasks to your current energy level for optimal productivity throughout the day.
        </p>
      </div>

      <Card className="border-amber-200 dark:border-amber-800 mb-8">
        <CardHeader>
          <CardTitle>How's your energy right now?</CardTitle>
          <CardDescription>Adjust the slider to match your current energy level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <BatteryLow className="h-6 w-6 text-amber-500" />
            <Slider
              value={[sliderValue]}
              onValueChange={(value) => setSliderValue(value[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <BatteryFull className="h-6 w-6 text-green-500" />
          </div>

          <div className="flex items-center justify-center gap-3 py-2">
            {getEnergyIcon()}
            <span className="font-medium">
              Your current energy level: {getEnergyLevelInfo(currentEnergyLevel).title}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Recommended Tasks for Your Energy Level</h2>

        {energyTasks[currentEnergyLevel].length > 0 ? (
          <div className="space-y-4">
            {energyTasks[currentEnergyLevel].map((task) => (
              <Card key={task.id} className={`${getEnergyLevelInfo(currentEnergyLevel).borderColor}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 h-8 w-8 rounded-full p-0"
                      onClick={() => completeTask(task.id)}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="sr-only">Complete</span>
                    </Button>
                    <div>
                      <h3 className="font-medium text-lg">{task.title}</h3>
                      {task.description && <p className="text-muted-foreground text-sm mt-1">{task.description}</p>}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.map((tagId) => (
                          <Badge key={tagId} variant="secondary">
                            {getTagName(tagId)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">No tasks available for your current energy level</p>
              <Button asChild variant="outline">
                <Link href="/tasks">Add some tasks</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full mb-8">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="by-energy">By Energy Level</TabsTrigger>
          <TabsTrigger value="about">About This Method</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>All Available Tasks</CardTitle>
              <CardDescription>View all your incomplete tasks</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              {tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-1 h-6 w-6 rounded-full p-0"
                          onClick={() => completeTask(task.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="sr-only">Complete</span>
                        </Button>
                        <div>
                          <h3 className="font-medium text-base">{task.title}</h3>
                          {task.description && <p className="text-muted-foreground text-sm mt-1">{task.description}</p>}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.tags.map((tagId) => (
                              <Badge key={tagId} variant="secondary" className="text-xs">
                                {getTagName(tagId)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No tasks available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-energy" className="mt-0">
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(energyTasks).map(([key, tasks]) => {
              const level = key as EnergyLevel
              const info = getEnergyLevelInfo(level)

              return (
                <Card key={key} className={`${info.borderColor}`}>
                  <CardHeader className={`${info.bgColor} rounded-t-xl border-b ${info.borderColor}`}>
                    <div className="flex items-center gap-2">
                      <info.icon className={`h-5 w-5 ${info.color}`} />
                      <CardTitle className="text-lg">{info.title}</CardTitle>
                    </div>
                    <CardDescription>{info.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-[300px] overflow-y-auto pt-4">
                    {tasks.length > 0 ? (
                      <div className="space-y-4">
                        {tasks.map((task) => (
                          <div key={task.id} className="border rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-1 h-6 w-6 rounded-full p-0"
                                onClick={() => completeTask(task.id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="sr-only">Complete</span>
                              </Button>
                              <div>
                                <h3 className="font-medium text-sm">{task.title}</h3>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {task.tags.slice(0, 2).map((tagId) => (
                                    <Badge key={tagId} variant="secondary" className="text-xs">
                                      {getTagName(tagId)}
                                    </Badge>
                                  ))}
                                  {task.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{task.tags.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4 text-sm">No tasks in this category</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="about" className="mt-0">
          <Card className="border-amber-100 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-900/20">
            <CardHeader>
              <CardTitle className="text-lg">About Energy-Based Task Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Energy-based task selection is a productivity approach that matches tasks to your current energy level,
                rather than trying to force yourself to do difficult work when you're tired.
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium">The three energy levels:</h4>
                  <ul className="list-disc pl-5 text-sm space-y-2 mt-2">
                    <li>
                      <span className="font-medium text-green-600 dark:text-green-400">High Energy:</span>
                      <p className="mt-1">
                        Best for creative work, complex problem-solving, learning new skills, strategic thinking, and
                        important decisions.
                      </p>
                    </li>
                    <li>
                      <span className="font-medium text-blue-600 dark:text-blue-400">Medium Energy:</span>
                      <p className="mt-1">
                        Good for routine work that requires some focus, meetings, responding to emails, organizing, and
                        planning.
                      </p>
                    </li>
                    <li>
                      <span className="font-medium text-amber-600 dark:text-amber-400">Low Energy:</span>
                      <p className="mt-1">
                        Suitable for simple administrative tasks, organizing files, updating records, and other
                        low-cognitive load activities.
                      </p>
                    </li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground">
                  By matching tasks to your energy level, you can maintain productivity throughout the day and avoid
                  burnout.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}

