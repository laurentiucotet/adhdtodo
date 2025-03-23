"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { TaskListSupabase } from "@/components/task-list-supabase"
import { AddTaskCardSupabase } from "@/components/add-task-card-supabase"
import { FilterBar } from "@/components/filter-bar"
import { Skeleton } from "@/components/ui/skeleton"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { useMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TasksContent() {
  const [tasks, setTasks] = useState([])
  const [tags, setTags] = useState([])
  const [categories, setCategories] = useState([])
  const [savedFilters, setSavedFilters] = useState([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("newest")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const isMobile = useMobile()
  const supabase = createClient()

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

        // Fetch saved filters
        const { data: filtersData, error: filtersError } = await supabase
          .from("saved_filters")
          .select("*, saved_filter_tags(tag_id)")

        if (filtersError) throw filtersError

        // Transform tasks data
        const transformedTasks = tasksData.map((task: any) => ({
          ...task,
          tags: task.task_tags?.map((tt: any) => tt.tag_id) || [],
        }))

        // Transform saved filters data
        const transformedFilters = filtersData.map((filter: any) => ({
          ...filter,
          tagIds: filter.saved_filter_tags?.map((sft: any) => sft.tag_id) || [],
        }))

        setTasks(transformedTasks)
        setTags(tagsData)
        setCategories(categoriesData)
        setSavedFilters(transformedFilters)
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
  }, [supabase, toast])

  // Apply a saved filter
  const applyFilter = (filterId: string | null) => {
    setSelectedFilter(filterId)

    if (!filterId) {
      setSelectedTags([])
      return
    }

    const filter = savedFilters.find((f: any) => f.id === filterId)
    if (filter) {
      setSelectedTags(filter.tagIds)
    }
  }

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setSelectedFilter(null)
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  // Handle task added
  const handleTaskAdded = () => {
    // Refresh tasks
    supabase
      .from("tasks")
      .select("*, task_tags(tag_id)")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching tasks:", error)
          return
        }

        const transformedTasks = data.map((task: any) => ({
          ...task,
          tags: task.task_tags?.map((tt: any) => tt.tag_id) || [],
        }))

        setTasks(transformedTasks)
      })
  }

  // Determine the backend for DnD
  const Backend = isMobile ? TouchBackend : HTML5Backend

  if (loading) {
    return (
      <main className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Tasks</h1>

        <div className="mb-6">
          <Skeleton className="w-full h-40 rounded-xl" />
        </div>

        <div className="flex justify-end mb-4">
          <Skeleton className="w-32 h-10 rounded-lg" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-full h-24 rounded-xl" />
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Tasks</h1>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex-1">
          <FilterBar
            tags={tags}
            categories={categories}
            selectedTags={selectedTags}
            savedFilters={savedFilters}
            selectedFilter={selectedFilter}
            onTagSelect={toggleTag}
            onFilterSelect={applyFilter}
            onAddTag={() => {}}
            onEditTag={() => {}}
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

      <DndProvider backend={Backend}>
        <TaskListSupabase
          initialTasks={tasks}
          initialTags={tags}
          initialCategories={categories}
          selectedTags={selectedTags}
          sortBy={sortBy}
        />
      </DndProvider>

      <AddTaskCardSupabase tags={tags} onTaskAdded={handleTaskAdded} />
    </main>
  )
}

