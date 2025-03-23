"use client"

import { useState, useEffect } from "react"
import { db, type Task, type Tag } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Plus, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import TaskList from "@/components/task-list"
import TaskForm from "@/components/task-form"
import DataMigration from "@/components/data-migration"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function TasksPage() {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  // Load data on initial render
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // Check if user is authenticated
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          window.location.href = "/auth/login"
          return
        }

        // Load tasks and tags
        const [tasksData, tagsData] = await Promise.all([db.tasks.getAll(), db.tags.getAll()])

        setTasks(tasksData)
        setTags(tagsData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load your tasks. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Set up real-time subscription for tasks
    const tasksSubscription = supabase
      .channel("tasks-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        () => {
          // Refresh tasks when changes occur
          db.tasks.getAll().then((updatedTasks) => {
            setTasks(updatedTasks)
          })
        },
      )
      .subscribe()

    // Set up real-time subscription for tags
    const tagsSubscription = supabase
      .channel("tags-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tags",
        },
        () => {
          // Refresh tags when changes occur
          db.tags.getAll().then((updatedTags) => {
            setTags(updatedTags)
          })
        },
      )
      .subscribe()

    return () => {
      // Clean up subscriptions
      supabase.removeChannel(tasksSubscription)
      supabase.removeChannel(tagsSubscription)
    }
  }, [supabase, toast])

  const handleAddTask = async (taskData: Omit<Task, "id" | "created_at" | "updated_at" | "user_id">) => {
    try {
      const newTask = await db.tasks.create(taskData)
      if (newTask) {
        setTasks((prev) => [newTask, ...prev])
        setIsAddingTask(false)
        toast({
          title: "Task added",
          description: "Your task has been added successfully.",
        })
      }
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTask = async (id: string, updates: Partial<Omit<Task, "id" | "created_at" | "user_id">>) => {
    try {
      const updatedTask = await db.tasks.update(id, updates)
      if (updatedTask) {
        setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)))
        setEditingTask(null)
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        })
      }
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await db.tasks.delete(id)
      setTasks((prev) => prev.filter((task) => task.id !== id))
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      const updatedTask = await db.tasks.toggleComplete(id, isCompleted)
      if (updatedTask) {
        setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)))
      }
    } catch (error) {
      console.error("Error toggling task completion:", error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddingTask(true)} className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Task
          </Button>
          <Button variant="outline" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <DataMigration />

      {isAddingTask && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <TaskForm onSubmit={handleAddTask} onCancel={() => setIsAddingTask(false)} availableTags={tags} />
          </CardContent>
        </Card>
      )}

      {editingTask && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <TaskForm
              task={editingTask}
              onSubmit={(updates) => handleUpdateTask(editingTask.id, updates)}
              onCancel={() => setEditingTask(null)}
              availableTags={tags}
            />
          </CardContent>
        </Card>
      )}

      <TaskList
        tasks={tasks}
        tags={tags}
        onEdit={setEditingTask}
        onDelete={handleDeleteTask}
        onToggleComplete={handleToggleComplete}
      />
    </div>
  )
}

