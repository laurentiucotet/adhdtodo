import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

/**
 * Utility to migrate data from localStorage to Supabase
 */
export async function migrateLocalDataToSupabase() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    console.error("User not authenticated")
    return { success: false, error: "User not authenticated" }
  }

  try {
    // Check if migration has already been performed
    const { data: migrationCheck } = await supabase.from("tasks").select("id").limit(1)

    // If user already has data in Supabase, skip migration
    if (migrationCheck && migrationCheck.length > 0) {
      console.log("Migration already performed")
      return { success: true, message: "Migration already performed" }
    }

    // Get data from localStorage
    const localTasks = localStorage.getItem("tasks")
    const localTags = localStorage.getItem("tags")
    const localTagCategories = localStorage.getItem("tagCategories")
    const localSavedFilters = localStorage.getItem("savedFilters")
    const localTimeCategories = localStorage.getItem("timeCategories")

    // Parse data
    const tasks = localTasks ? JSON.parse(localTasks) : []
    const tags = localTags ? JSON.parse(localTags) : []
    const tagCategories = localTagCategories ? JSON.parse(localTagCategories) : []
    const savedFilters = localSavedFilters ? JSON.parse(localSavedFilters) : []
    const timeCategories = localTimeCategories ? JSON.parse(localTimeCategories) : []

    // Create ID mappings to maintain relationships
    const tagIdMap = new Map()
    const categoryIdMap = new Map()
    const taskIdMap = new Map()
    const filterIdMap = new Map()
    const timeCategoryIdMap = new Map()

    // Migrate tag categories
    if (tagCategories.length > 0) {
      const formattedCategories = tagCategories.map((category) => {
        const newId = uuidv4()
        categoryIdMap.set(category.id, newId)

        return {
          id: newId,
          user_id: session.user.id,
          name: category.name,
          description: category.description || "",
          color: category.color,
          created_at: new Date().toISOString(),
        }
      })

      const { error: categoriesError } = await supabase.from("tag_categories").insert(formattedCategories)

      if (categoriesError) {
        throw categoriesError
      }
    }

    // Migrate tags
    if (tags.length > 0) {
      const formattedTags = tags.map((tag) => {
        const newId = uuidv4()
        tagIdMap.set(tag.id, newId)

        return {
          id: newId,
          user_id: session.user.id,
          name: tag.name,
          keywords: tag.keywords || [],
          category_id: tag.category ? categoryIdMap.get(tag.category) : null,
          date_range_enabled: tag.dateRange?.enabled || false,
          date_range_start_days: tag.dateRange?.startDays || null,
          date_range_end_days: tag.dateRange?.endDays || null,
          created_at: new Date().toISOString(),
        }
      })

      const { error: tagsError } = await supabase.from("tags").insert(formattedTags)

      if (tagsError) {
        throw tagsError
      }
    }

    // Migrate tasks
    if (tasks.length > 0) {
      const formattedTasks = tasks.map((task, index) => {
        const newId = uuidv4()
        taskIdMap.set(task.id, newId)

        return {
          id: newId,
          user_id: session.user.id,
          title: task.title,
          description: task.description || null,
          completed: task.completed || false,
          due_date: task.dueDate || null,
          order_index: task.order !== undefined ? task.order : index,
          created_at: task.createdAt ? new Date(task.createdAt).toISOString() : new Date().toISOString(),
        }
      })

      const { error: tasksError } = await supabase.from("tasks").insert(formattedTasks)

      if (tasksError) {
        throw tasksError
      }

      // Migrate task-tag relationships
      const taskTags = []
      tasks.forEach((task) => {
        if (task.tags && task.tags.length > 0) {
          task.tags.forEach((tagId) => {
            const newTagId = tagIdMap.get(tagId)
            if (newTagId) {
              taskTags.push({
                task_id: taskIdMap.get(task.id),
                tag_id: newTagId,
              })
            }
          })
        }
      })

      if (taskTags.length > 0) {
        const { error: taskTagsError } = await supabase.from("task_tags").insert(taskTags)

        if (taskTagsError) {
          throw taskTagsError
        }
      }
    }

    // Migrate saved filters
    if (savedFilters.length > 0) {
      const formattedFilters = savedFilters.map((filter) => {
        const newId = uuidv4()
        filterIdMap.set(filter.id, newId)

        return {
          id: newId,
          user_id: session.user.id,
          name: filter.name,
          created_at: new Date().toISOString(),
        }
      })

      const { error: filtersError } = await supabase.from("saved_filters").insert(formattedFilters)

      if (filtersError) {
        throw filtersError
      }

      // Migrate filter-tag relationships
      const filterTags = []
      savedFilters.forEach((filter) => {
        if (filter.tagIds && filter.tagIds.length > 0) {
          filter.tagIds.forEach((tagId) => {
            const newTagId = tagIdMap.get(tagId)
            if (newTagId) {
              filterTags.push({
                filter_id: filterIdMap.get(filter.id),
                tag_id: newTagId,
              })
            }
          })
        }
      })

      if (filterTags.length > 0) {
        const { error: filterTagsError } = await supabase.from("saved_filter_tags").insert(filterTags)

        if (filterTagsError) {
          throw filterTagsError
        }
      }
    }

    // Migrate time categories
    if (timeCategories.length > 0) {
      const formattedTimeCategories = timeCategories.map((category) => {
        const newId = uuidv4()
        timeCategoryIdMap.set(category.id, newId)

        return {
          id: newId,
          user_id: session.user.id,
          name: category.name,
          description: category.description || "",
          color: category.color,
          order_index: category.order || 0,
          created_at: new Date().toISOString(),
        }
      })

      const { error: timeCategoriesError } = await supabase.from("time_categories").insert(formattedTimeCategories)

      if (timeCategoriesError) {
        throw timeCategoriesError
      }
    }

    // Migrate task-time category relationships
    const taskTimeCategories = localStorage.getItem("taskTimeCategories")
    if (taskTimeCategories) {
      const taskTimeCategoryMap = JSON.parse(taskTimeCategories)
      const relationships = []

      Object.entries(taskTimeCategoryMap).forEach(([taskId, categoryId]) => {
        const newTaskId = taskIdMap.get(taskId)
        const newCategoryId = timeCategoryIdMap.get(categoryId as string)

        if (newTaskId && newCategoryId) {
          relationships.push({
            task_id: newTaskId,
            category_id: newCategoryId,
          })
        }
      })

      if (relationships.length > 0) {
        const { error: relationshipsError } = await supabase.from("task_time_categories").insert(relationships)

        if (relationshipsError) {
          throw relationshipsError
        }
      }
    }

    console.log("Migration completed successfully")
    return { success: true, message: "Migration completed successfully" }
  } catch (error) {
    console.error("Migration error:", error)
    return { success: false, error }
  }
}

