"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { autoTagTask } from "@/lib/utils/tag-utils"

// Get all tasks for the current user
export async function getTasks() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*, task_tags(tag_id)")
    .eq("user_id", session.user.id)
    .order("order_index", { ascending: true })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  // Transform the data to match our client-side structure
  return data.map((task: any) => ({
    ...task,
    tags: task.task_tags?.map((tt: any) => tt.tag_id) || [],
  }))
}

// Get a single task by ID
export async function getTask(taskId: string) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*, task_tags(tag_id)")
    .eq("id", taskId)
    .eq("user_id", session.user.id)
    .single()

  if (error) {
    console.error("Error fetching task:", error)
    return null
  }

  return {
    ...data,
    tags: data.task_tags?.map((tt: any) => tt.tag_id) || [],
  }
}

// Create a new task
export async function createTask(title: string, description: string | null, dueDate: string | null) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  // Get the highest order_index
  const { data: tasks } = await supabase
    .from("tasks")
    .select("order_index")
    .eq("user_id", session.user.id)
    .order("order_index", { ascending: false })
    .limit(1)

  const orderIndex = tasks && tasks.length > 0 ? tasks[0].order_index + 1 : 0

  // Insert the task
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: session.user.id,
      title,
      description,
      due_date: dueDate,
      order_index: orderIndex,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating task:", error)
    return null
  }

  // Auto-tag the task
  if (data) {
    await autoTagTaskInDb(data.id, title, description || "", dueDate)
  }

  revalidatePath("/tasks")
  return data
}

// Update a task
export async function updateTask(taskId: string, title: string, description: string | null, dueDate: string | null) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      title,
      description,
      due_date: dueDate,
    })
    .eq("id", taskId)
    .eq("user_id", session.user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating task:", error)
    return null
  }

  // Re-tag the task
  if (data) {
    // First, remove existing tags
    await supabase.from("task_tags").delete().eq("task_id", taskId)

    // Then, auto-tag the task
    await autoTagTaskInDb(taskId, title, description || "", dueDate)
  }

  revalidatePath("/tasks")
  return data
}

// Toggle task completion
export async function toggleTaskCompletion(taskId: string) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  // First, get the current state
  const { data: task } = await supabase
    .from("tasks")
    .select("completed")
    .eq("id", taskId)
    .eq("user_id", session.user.id)
    .single()

  if (!task) {
    console.error("Task not found")
    return null
  }

  // Toggle the completed state
  const { data, error } = await supabase
    .from("tasks")
    .update({
      completed: !task.completed,
    })
    .eq("id", taskId)
    .eq("user_id", session.user.id)
    .select()
    .single()

  if (error) {
    console.error("Error toggling task completion:", error)
    return null
  }

  revalidatePath("/tasks")
  return data
}

// Delete a task
export async function deleteTask(taskId: string) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", session.user.id)

  if (error) {
    console.error("Error deleting task:", error)
    return false
  }

  revalidatePath("/tasks")
  return true
}

// Reorder tasks
export async function reorderTasks(taskIds: string[]) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  // Update each task's order_index
  const updates = taskIds.map((id, index) =>
    supabase.from("tasks").update({ order_index: index }).eq("id", id).eq("user_id", session.user.id),
  )

  try {
    await Promise.all(updates)
    revalidatePath("/tasks")
    return true
  } catch (error) {
    console.error("Error reordering tasks:", error)
    return false
  }
}

// Helper function to auto-tag a task in the database
async function autoTagTaskInDb(taskId: string, title: string, description: string, dueDate: string | null) {
  const supabase = createClient()

  // Get all tags for the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return

  const { data: tags } = await supabase.from("tags").select("*").eq("user_id", session.user.id)

  if (!tags) return

  // Auto-tag the task
  const tagIds = autoTagTask(title, description, dueDate, tags)

  // Insert task_tags
  if (tagIds.length > 0) {
    const taskTags = tagIds.map((tagId) => ({
      task_id: taskId,
      tag_id: tagId,
    }))

    await supabase.from("task_tags").insert(taskTags)
  }
}

