import { supabase } from "@/lib/supabase/client"

// Define types for our database entities
export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  is_completed: boolean
  priority: string
  due_date?: string
  created_at: string
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  category_id?: string
}

export interface TagCategory {
  id: string
  user_id: string
  name: string
}

// Database service
export const db = {
  // Task operations
  tasks: {
    async getAll(): Promise<Task[]> {
      try {
        const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false })

        if (error) throw error
        return data || []
      } catch (error) {
        console.error("Error fetching tasks:", error)
        return []
      }
    },

    async getById(id: string): Promise<Task | null> {
      try {
        const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single()

        if (error) throw error
        return data
      } catch (error) {
        console.error(`Error fetching task with id ${id}:`, error)
        return null
      }
    },

    async create(task: Omit<Task, "id" | "user_id" | "created_at">): Promise<Task | null> {
      try {
        const { data, error } = await supabase.from("tasks").insert([task]).select().single()

        if (error) throw error
        return data
      } catch (error) {
        console.error("Error creating task:", error)
        return null
      }
    },

    async update(id: string, updates: Partial<Task>): Promise<Task | null> {
      try {
        const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select().single()

        if (error) throw error
        return data
      } catch (error) {
        console.error(`Error updating task with id ${id}:`, error)
        return null
      }
    },

    async delete(id: string): Promise<boolean> {
      try {
        const { error } = await supabase.from("tasks").delete().eq("id", id)

        if (error) throw error
        return true
      } catch (error) {
        console.error(`Error deleting task with id ${id}:`, error)
        return false
      }
    },

    async toggleComplete(id: string, isCompleted: boolean): Promise<Task | null> {
      return this.update(id, { is_completed: isCompleted })
    },
  },

  // Tag operations
  tags: {
    async getAll(): Promise<Tag[]> {
      try {
        const { data, error } = await supabase.from("tags").select("*")

        if (error) throw error
        return data || []
      } catch (error) {
        console.error("Error fetching tags:", error)
        return []
      }
    },

    async create(tag: Omit<Tag, "id" | "user_id">): Promise<Tag | null> {
      try {
        const { data, error } = await supabase.from("tags").insert([tag]).select().single()

        if (error) throw error
        return data
      } catch (error) {
        console.error("Error creating tag:", error)
        return null
      }
    },

    async update(id: string, updates: Partial<Tag>): Promise<Tag | null> {
      try {
        const { data, error } = await supabase.from("tags").update(updates).eq("id", id).select().single()

        if (error) throw error
        return data
      } catch (error) {
        console.error(`Error updating tag with id ${id}:`, error)
        return null
      }
    },

    async delete(id: string): Promise<boolean> {
      try {
        const { error } = await supabase.from("tags").delete().eq("id", id)

        if (error) throw error
        return true
      } catch (error) {
        console.error(`Error deleting tag with id ${id}:`, error)
        return false
      }
    },
  },

  // Tag categories operations
  tagCategories: {
    async getAll(): Promise<TagCategory[]> {
      try {
        const { data, error } = await supabase.from("tag_categories").select("*")

        if (error) throw error
        return data || []
      } catch (error) {
        console.error("Error fetching tag categories:", error)
        return []
      }
    },
  },

  // Data migration utility
  migration: {
    async migrateFromLocalStorage(): Promise<boolean> {
      try {
        // Get data from localStorage
        const tasksJson = localStorage.getItem("tasks")
        const tagsJson = localStorage.getItem("tags")

        if (!tasksJson && !tagsJson) {
          console.log("No data found in localStorage to migrate")
          return false
        }

        // Parse the data
        const tasks = tasksJson ? JSON.parse(tasksJson) : []
        const tags = tagsJson ? JSON.parse(tagsJson) : []

        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          console.error("No authenticated user found for migration")
          return false
        }

        // Migrate tags first (if any)
        if (tags.length > 0) {
          const { error: tagError } = await supabase.from("tags").insert(
            tags.map((tag: any) => ({
              name: tag.name,
              color: tag.color || "#3b82f6",
              user_id: user.id,
            })),
          )

          if (tagError) throw tagError
        }

        // Migrate tasks
        if (tasks.length > 0) {
          const { error: taskError } = await supabase.from("tasks").insert(
            tasks.map((task: any) => ({
              title: task.title,
              description: task.description || "",
              is_completed: task.completed || false,
              priority: task.priority || "medium",
              due_date: task.dueDate || null,
              user_id: user.id,
            })),
          )

          if (taskError) throw taskError
        }

        // Clear localStorage after successful migration
        localStorage.removeItem("tasks")
        localStorage.removeItem("tags")

        return true
      } catch (error) {
        console.error("Error migrating data from localStorage:", error)
        return false
      }
    },
  },
}

