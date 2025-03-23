"use client"

import { useState, useEffect } from "react"
import { TaskList } from "./task-list"
import { FilterBar } from "./filter-bar"
import { AddTaskCard } from "./add-task-card"
import type { Task, SavedFilter, TagCategory } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { autoTagTask } from "@/lib/tag-utils"

// Define Tag type here as it's missing
export type Tag = {
  id: string
  name: string
  keywords: string[]
  category: string // ID of the category this tag belongs to
  dateRange?: {
    enabled: boolean
    startDays: number | null // Days from today (0 = today, 1 = tomorrow, etc.)
    endDays: number | null // Days from today (null = no end date)
  }
}

export function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [categories, setCategories] = useState<TagCategory[]>([])
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>("newest")

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    const savedTags = localStorage.getItem("tags")
    const savedCategories = localStorage.getItem("tagCategories")
    const filters = localStorage.getItem("savedFilters")

    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks)
      // Add order property if it doesn't exist
      const tasksWithOrder = parsedTasks.map((task: Task, index: number) => ({
        ...task,
        order: task.order !== undefined ? task.order : index,
        dueDate: task.dueDate || null,
      }))
      setTasks(tasksWithOrder)
    }

    if (savedTags) {
      setTags(JSON.parse(savedTags))
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories))
    }

    if (filters) {
      setSavedFilters(JSON.parse(filters))
    }
  }, [])

  // Save data to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
    localStorage.setItem("tags", JSON.stringify(tags))
  }, [tasks, tags])

  // Add a new task
  const addTask = (title: string, description: string, dueDate: string | null) => {
    const autoTags = autoTagTask(title, description, dueDate, tags)
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      completed: false,
      tags: autoTags,
      createdAt: Date.now(),
      dueDate,
      order: tasks.length, // Add at the end
    }
    setTasks((prev) => [newTask, ...prev])
  }

  // Edit an existing task
  const editTask = (taskId: string, title: string, description: string, dueDate: string | null) => {
    const autoTags = autoTagTask(title, description, dueDate, tags)
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, title, description, tags: autoTags, dueDate } : task)),
    )
  }

  // Toggle task completion status
  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  // Delete a task
  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  // Handle task reordering
  const moveTask = (dragIndex: number, hoverIndex: number) => {
    setTasks((prevTasks) => {
      const sortedTasks = getSortedTasks(prevTasks)
      const draggedTask = sortedTasks[dragIndex]

      // Create a new array without the dragged task
      const newTasks = sortedTasks.filter((_, idx) => idx !== dragIndex)

      // Insert the dragged task at the new position
      newTasks.splice(hoverIndex, 0, draggedTask)

      // Update the order property for all tasks
      return newTasks.map((task, index) => ({
        ...task,
        order: index,
      }))
    })
  }

  // Apply a saved filter
  const applyFilter = (filterId: string | null) => {
    setSelectedFilter(filterId)

    if (!filterId) {
      setSelectedTags([])
      return
    }

    const filter = savedFilters.find((f) => f.id === filterId)
    if (filter) {
      setSelectedTags(filter.tagIds)
    }
  }

  // Get filtered and sorted tasks
  const getSortedTasks = (taskList: Task[]) => {
    let filtered = taskList

    // Apply tag filtering
    if (selectedTags.length > 0) {
      filtered = filtered.filter((task) => selectedTags.some((tag) => task.tags.includes(tag)))
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt - a.createdAt
        case "oldest":
          return a.createdAt - b.createdAt
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case "alphabetical":
          return a.title.localeCompare(b.title)
        case "custom":
          return a.order - b.order
        default:
          return 0
      }
    })
  }

  const filteredAndSortedTasks = getSortedTasks(tasks)

  const onAddTag = (name: string, keywords: string[], category: string, dateRange: Tag["dateRange"] | null) => {
    const newTag = {
      id: `tag-${Date.now()}`,
      name,
      keywords,
      category: category || "general",
      dateRange: dateRange || undefined,
    }
    setTags((prevTags) => [...prevTags, newTag])
  }

  const onEditTag = (
    tagId: string,
    name: string,
    keywords: string[],
    category: string,
    dateRange: Tag["dateRange"] | null,
  ) => {
    setTags((prevTags) =>
      prevTags.map((tag) =>
        tag.id === tagId
          ? {
              ...tag,
              name,
              keywords,
              category: category || "general",
              dateRange: dateRange || undefined,
            }
          : tag,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <AddTaskCard onAddTask={addTask} />

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1">
          <FilterBar
            tags={tags}
            categories={categories}
            selectedTags={selectedTags}
            savedFilters={savedFilters}
            selectedFilter={selectedFilter}
            onTagSelect={(tagId) => {
              setSelectedFilter(null)
              setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
            }}
            onFilterSelect={applyFilter}
            onAddTag={onAddTag}
            onEditTag={onEditTag}
          />
        </div>
        <div className="flex items-center">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
              <SelectItem value="custom">Custom Order</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <TaskList
        tasks={filteredAndSortedTasks}
        tags={tags}
        categories={categories}
        onToggleComplete={toggleTaskCompletion}
        onEdit={editTask}
        onDelete={deleteTask}
        onMove={moveTask}
        sortable={sortBy === "custom"}
      />
    </div>
  )
}

