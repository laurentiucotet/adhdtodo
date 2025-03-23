"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, ArrowLeft, Play, Pause, SkipForward, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import type { Task, Tag } from "@/lib/types"
import { useMobile } from "@/hooks/use-mobile"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

type PomodoroState = "work" | "shortBreak" | "longBreak" | "idle"

export default function PomodoroPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [pomodoroState, setPomodoroState] = useState<PomodoroState>("idle")
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [workDuration, setWorkDuration] = useState(25)
  const [shortBreakDuration, setShortBreakDuration] = useState(5)
  const [longBreakDuration, setLongBreakDuration] = useState(15)
  const [pomodorosUntilLongBreak, setPomodorosUntilLongBreak] = useState(4)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isMobile = useMobile()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    const savedTags = localStorage.getItem("tags")

    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks)
      // Only include non-completed tasks
      const activeTasks = parsedTasks.filter((task: Task) => !task.completed)
      setTasks(activeTasks)
    }

    if (savedTags) {
      setTags(JSON.parse(savedTags))
    }

    // Initialize audio
    audioRef.current = new Audio("/sounds/bell.mp3")

    return () => {
      // Clean up timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished
            clearInterval(timerRef.current as NodeJS.Timeout)

            // Play sound
            if (audioRef.current) {
              audioRef.current.play().catch((e) => console.error("Error playing sound:", e))
            }

            // Handle state transition
            if (pomodoroState === "work") {
              const newCompletedPomodoros = completedPomodoros + 1
              setCompletedPomodoros(newCompletedPomodoros)

              // Determine if we need a long break
              if (newCompletedPomodoros % pomodorosUntilLongBreak === 0) {
                setPomodoroState("longBreak")
                return longBreakDuration * 60
              } else {
                setPomodoroState("shortBreak")
                return shortBreakDuration * 60
              }
            } else {
              // After any break, go back to work
              setPomodoroState("work")
              return workDuration * 60
            }
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [
    isRunning,
    pomodoroState,
    completedPomodoros,
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    pomodorosUntilLongBreak,
  ])

  // Get tag name by ID
  const getTagName = (tagId: string) => {
    const tag = tags.find((tag) => tag.id === tagId)
    return tag ? tag.name : tagId
  }

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Start timer
  const startTimer = () => {
    if (pomodoroState === "idle") {
      setPomodoroState("work")
      setTimeLeft(workDuration * 60)
    }
    setIsRunning(true)
  }

  // Pause timer
  const pauseTimer = () => {
    setIsRunning(false)
  }

  // Skip to next state
  const skipToNext = () => {
    if (pomodoroState === "work") {
      const newCompletedPomodoros = completedPomodoros + 1
      setCompletedPomodoros(newCompletedPomodoros)

      if (newCompletedPomodoros % pomodorosUntilLongBreak === 0) {
        setPomodoroState("longBreak")
        setTimeLeft(longBreakDuration * 60)
      } else {
        setPomodoroState("shortBreak")
        setTimeLeft(shortBreakDuration * 60)
      }
    } else {
      setPomodoroState("work")
      setTimeLeft(workDuration * 60)
    }
    setIsRunning(false)
  }

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false)
    setPomodoroState("idle")
    setTimeLeft(workDuration * 60)
    setCompletedPomodoros(0)
  }

  // Complete task
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

    // If this was the selected task, clear it
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(null)
    }
  }

  // Get state display info
  const getStateInfo = (state: PomodoroState) => {
    switch (state) {
      case "work":
        return {
          title: "Focus Time",
          description: "Concentrate on your task",
          color: "text-red-500",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
        }
      case "shortBreak":
        return {
          title: "Short Break",
          description: "Take a quick breather",
          color: "text-green-500",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
        }
      case "longBreak":
        return {
          title: "Long Break",
          description: "Take a longer rest",
          color: "text-blue-500",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
        }
      case "idle":
        return {
          title: "Ready to Start",
          description: "Select a task and begin your focus session",
          color: "text-gray-500",
          bgColor: "bg-gray-50 dark:bg-gray-800/20",
          borderColor: "border-gray-200 dark:border-gray-700",
        }
    }
  }

  // Calculate progress percentage
  const calculateProgress = () => {
    if (pomodoroState === "idle") return 0

    const totalSeconds =
      pomodoroState === "work"
        ? workDuration * 60
        : pomodoroState === "shortBreak"
          ? shortBreakDuration * 60
          : longBreakDuration * 60

    return 100 - (timeLeft / totalSeconds) * 100
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
          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
            <Clock className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold">Pomodoro Focus</h1>
        </div>
        <p className="text-muted-foreground">
          Work in focused intervals with the Pomodoro technique to maintain productivity and prevent burnout.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <Card className={`mb-6 ${getStateInfo(pomodoroState).borderColor}`}>
            <CardHeader
              className={`${getStateInfo(pomodoroState).bgColor} rounded-t-xl border-b ${getStateInfo(pomodoroState).borderColor}`}
            >
              <CardTitle className={getStateInfo(pomodoroState).color}>{getStateInfo(pomodoroState).title}</CardTitle>
              <CardDescription>{getStateInfo(pomodoroState).description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-6">{formatTime(timeLeft)}</div>
                <Progress value={calculateProgress()} className="h-2 mb-6" />
                <div className="flex justify-center gap-3 mb-4">
                  {!isRunning ? (
                    <Button onClick={startTimer} className="bg-red-500 hover:bg-red-600">
                      <Play className="mr-2 h-4 w-4" />
                      {pomodoroState === "idle" ? "Start" : "Resume"}
                    </Button>
                  ) : (
                    <Button onClick={pauseTimer} variant="outline">
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </Button>
                  )}
                  {pomodoroState !== "idle" && (
                    <Button onClick={skipToNext} variant="outline">
                      <SkipForward className="mr-2 h-4 w-4" />
                      Skip
                    </Button>
                  )}
                </div>
                {pomodoroState !== "idle" && (
                  <Button onClick={resetTimer} variant="ghost" size="sm" className="text-muted-foreground">
                    Reset Timer
                  </Button>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <div className="w-full text-center">
                <p className="text-sm text-muted-foreground">
                  Completed Pomodoros: <span className="font-medium">{completedPomodoros}</span>
                </p>
              </div>
            </CardFooter>
          </Card>

          {selectedTask ? (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-lg">Current Task</CardTitle>
                <CardDescription>Focus on this task during your work intervals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-bold text-xl">{selectedTask.title}</h3>
                  {selectedTask.description && <p className="text-muted-foreground">{selectedTask.description}</p>}
                  <div className="flex flex-wrap gap-1">
                    {selectedTask.tags.map((tagId) => (
                      <Badge key={tagId} variant="secondary">
                        {getTagName(tagId)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className={`${isMobile ? "flex-col space-y-3" : "flex justify-between"}`}>
                <Button variant="outline" onClick={() => setSelectedTask(null)} className={isMobile ? "w-full" : ""}>
                  Change Task
                </Button>
                <Button
                  onClick={() => completeTask(selectedTask.id)}
                  className={`bg-green-600 hover:bg-green-700 ${isMobile ? "w-full" : ""}`}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Complete
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-dashed border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
              <CardContent className="pt-6 text-center py-8">
                <p className="text-muted-foreground mb-4">No task selected</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Select a task from the list to focus on during your Pomodoro sessions
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="tasks">Task List</TabsTrigger>
              <TabsTrigger value="settings">Timer Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Select a Task to Focus On</CardTitle>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto">
                  {tasks.length > 0 ? (
                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedTask?.id === task.id
                              ? "border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10"
                              : "hover:border-gray-300 dark:hover:border-gray-600"
                          }`}
                          onClick={() => setSelectedTask(task)}
                        >
                          <h3 className="font-medium text-base">{task.title}</h3>
                          {task.description && (
                            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.tags.map((tagId) => (
                              <Badge key={tagId} variant="secondary" className="text-xs">
                                {getTagName(tagId)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No tasks available</p>
                      <Button asChild variant="outline">
                        <Link href="/tasks">Add some tasks</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Pomodoro Timer Settings</CardTitle>
                  <CardDescription>Customize your work and break intervals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Work Duration: {workDuration} minutes</label>
                    </div>
                    <Slider
                      value={[workDuration]}
                      onValueChange={(value) => setWorkDuration(value[0])}
                      min={5}
                      max={60}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Short Break: {shortBreakDuration} minutes</label>
                    </div>
                    <Slider
                      value={[shortBreakDuration]}
                      onValueChange={(value) => setShortBreakDuration(value[0])}
                      min={1}
                      max={15}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Long Break: {longBreakDuration} minutes</label>
                    </div>
                    <Slider
                      value={[longBreakDuration]}
                      onValueChange={(value) => setLongBreakDuration(value[0])}
                      min={5}
                      max={30}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">
                        Pomodoros until long break: {pomodorosUntilLongBreak}
                      </label>
                    </div>
                    <Slider
                      value={[pomodorosUntilLongBreak]}
                      onValueChange={(value) => setPomodorosUntilLongBreak(value[0])}
                      min={2}
                      max={6}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="border-red-100 dark:border-red-900 bg-red-50/50 dark:bg-red-900/20 mt-6">
            <CardHeader>
              <CardTitle className="text-lg">About the Pomodoro Technique</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. It
                uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short
                breaks.
              </p>
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">How it works:</h4>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>Choose a task to work on</li>
                  <li>Set the timer for 25 minutes (one "Pomodoro")</li>
                  <li>Work on the task until the timer rings</li>
                  <li>Take a short 5-minute break</li>
                  <li>After four Pomodoros, take a longer 15-30 minute break</li>
                </ol>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                This technique helps maintain focus and avoid burnout by encouraging regular breaks and creating a sense
                of urgency with the timer.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

