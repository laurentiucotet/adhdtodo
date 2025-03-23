"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { TaskItem } from "./task-item"
import { Skeleton } from "@/components/ui/skeleton"
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TaskForm } from "./task-form"
import { useToast } from "@/hooks/use-toast"
import type { Task, Tag, TagCategory } from "@/lib/types"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { useMobile } from "@/hooks/use-mobile"

interface TaskListProps {
  initialTasks?: Task[]
  initialTags?: Tag[]
  initialCategories?: TagCategory[]
  selectedTags?: string[]
  sortBy?: string
}

export function TaskListSupabase({
  initialTasks = [],
  initialTags = [],
  initialCategories = [],
  selectedTags = [],
  sortBy = "newest",
}: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [categories, setCategories] = useState<TagCategory[]>(initialCategories)
  const [loading, setLoading] = useState(true)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const { toast } = useToast()
  const isMobile = useMobile()
  const supabase = createClient()

  // Fetch tasks, tags, and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*, task_tags(tag_id)")
          .order("created_at", { ascending: false })

        if (tasksError) throw tasksError

        // Fetch tags
        const { data: tagsData, error: tagsError } = await supabase.from("tags").select("*, category:tag_categories(*)")

        if (tagsError) throw tagsError

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase.from("tag_categories").select("*")

        if (categoriesError) throw categoriesError

        // Transform tasks data to include tags array
        const transformedTasks = tasksData.map((task: any) => ({
          ...task,
          tags: task.task_tags?.map((tt: any) => tt.tag_id) || [],
        }))

        setTasks(transformedTasks)
        setTags(tagsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load tasks. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up real-time subscription
    const tasksSubscription = supabase
      .channel("tasks-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, (payload) => {
        handleTaskChange(payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(tasksSubscription)
    }
  }, [supabase, toast])

  // Handle real-time task changes
  const handleTaskChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    if (eventType === "INSERT") {
      // Fetch the task with its tags
      fetchTaskWithTags(newRecord.id)
    } else if (eventType === "UPDATE") {
      // Update the task in the local state
      setTasks((prev) => prev.map((task) => (task.id === newRecord.id ? { ...task, ...newRecord } : task)))
    } else if (eventType === "DELETE") {
      // Remove the task from the local state
      setTasks((prev) => prev.filter((task) => task.id !== oldRecord.id))
    }
  }

  // Fetch a single task with its tags
  const fetchTaskWithTags = async (taskId: string) => {
    const { data, error } = await supabase.from("tasks").select("*, task_tags(tag_id)").eq("id", taskId).single()

    if (error) {
      console.error("Error fetching task:", error)
      return
    }

    const taskWithTags = {
      ...data,
      tags: data.task_tags?.map((tt: any) => tt.tag_id) || [],
    }

    setTasks((prev) => [taskWithTags, ...prev])
  }

  // Toggle task completion
  const toggleTaskCompletion = async (taskId: string) => {
    // Find the current task
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)))

    try {
      const { error } = await supabase.from("tasks").update({ completed: !task.completed }).eq("id", taskId)

      if (error) throw error
    } catch (error) {
      console.error("Error toggling task completion:", error)
      // Revert optimistic update
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: task.completed } : t)))
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete a task
  const deleteTask = async () => {
    if (!deleteTaskId) return

    // Optimistic update
    const taskToDelete = tasks.find((t) => t.id === deleteTaskId)
    setTasks((prev) => prev.filter((t) => t.id !== deleteTaskId))
    setDeleteTaskId(null)

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", deleteTaskId)

      if (error) throw error

      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      // Revert optimistic update if we have the task
      if (taskToDelete) {
        setTasks((prev) => [...prev, taskToDelete])
      }
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Update a task
  const updateTask = async (taskId: string, title: string, description: string, dueDate: string | null) => {
    try {
      // First update the task
      const { data, error } = await supabase
        .from("tasks")
        .update({
          title,
          description,
          due_date: dueDate,
        })
        .eq("id", taskId)
        .select()
        .single()

      if (error) throw error

      // Then fetch the updated task with tags
      await fetchTaskWithTags(taskId)

      setShowEditSheet(false)
      setEditingTaskId(null)

      toast({
        title: "Task updated",
        description: "The task has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Move task (reorder)
  const moveTask = async (dragIndex: number, hoverIndex: number) => {
    const draggedTask = tasks[dragIndex]
    const updatedTasks = [...tasks]
    updatedTasks.splice(dragIndex, 1)
    updatedTasks.splice(hoverIndex, 0, draggedTask)

    // Update local state
    setTasks(updatedTasks)

    // Update order_index for each task
    try {
      const updates = updatedTasks.map((task, index) =>
        supabase.from("tasks").update({ order_index: index }).eq("id", task.id),
      )

      await Promise.all(updates)
    } catch (error) {
      console.error("Error reordering tasks:", error)
      toast({
        title: "Error",
        description: "Failed to reorder tasks. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Get tag name by ID
  const getTagName = (tagId: string) => {
    const tag = tags.find((tag) => tag.id === tagId)
    return tag ? tag.name : tagId
  }

  // Get tag category by ID
  const getTagCategory = (tagId: string) => {
    const tag = tags.find((tag) => tag.id === tagId)
    if (!tag || !tag.category_id) return undefined

    return categories.find((category) => category.id === tag.category_id)
  }

  // Filter and sort tasks
  const getFilteredAndSortedTasks = () => {
    let filtered = tasks

    // Apply tag filtering
    if (selectedTags.length > 0) {
      filtered = filtered.filter((task) => task.tags.some((tagId) => selectedTags.includes(tagId)))
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "dueDate":
          if (!a.due_date && !b.due_date) return 0
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        case "alphabetical":
          return a.title.localeCompare(b.title)
        case "custom":
          return a.order_index - b.order_index
        default:
          return 0
      }
    })
  }

  const filteredAndSortedTasks = getFilteredAndSortedTasks()

  // Determine the backend for DnD
  const Backend = isMobile ? TouchBackend : HTML5Backend

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start space-x-4">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (filteredAndSortedTasks.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No tasks found. Add a new task to get started!</div>
  }

  return (
    <DndProvider backend={Backend}>
      <div className="space-y-4">
        {filteredAndSortedTasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            index={index}
            getTagName={getTagName}
            getTagCategory={getTagCategory}
            onToggleComplete={() => toggleTaskCompletion(task.id)}
            onEdit={() => {
              setEditingTaskId(task.id)
              setShowEditSheet(true)
            }}
            onDelete={() => setDeleteTaskId(task.id)}
            onMove={moveTask}
            sortable={sortBy === "custom"}
          />
        ))}
      </div>

      {/* Edit Task Sheet */}
      <Sheet
        open={showEditSheet && !!editingTaskId}
        onOpenChange={(open) => {
          setShowEditSheet(open)
          if (!open) setEditingTaskId(null)
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Task</SheetTitle>
          </SheetHeader>
          {editingTaskId && (
            <div className="mt-6">
              <TaskForm
                initialTitle={tasks.find((t) => t.id === editingTaskId)?.title || ""}
                initialDescription={tasks.find((t) => t.id === editingTaskId)?.description || ""}
                initialDueDate={tasks.find((t) => t.id === editingTaskId)?.due_date || null}
                onSubmit={(title, description, dueDate) => {
                  updateTask(editingTaskId, title, description, dueDate)
                }}
                isEditing={true}
                onCancel={() => {
                  setShowEditSheet(false)
                  setEditingTaskId(null)
                }}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteTaskId !== null} onOpenChange={(open) => !open && setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteTask}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DndProvider>
  )
}

