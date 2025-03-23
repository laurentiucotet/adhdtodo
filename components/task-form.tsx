"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { type Task, type Tag, db } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface TaskFormProps {
  task?: Task
  onSubmit: (task: any) => void
  onCancel: () => void
  availableTags: Tag[]
}

export default function TaskForm({ task, onSubmit, onCancel, availableTags }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [priority, setPriority] = useState(task?.priority || "medium")
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.due_date ? new Date(task.due_date) : undefined)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load task tags if editing an existing task
  useEffect(() => {
    async function loadTaskTags() {
      if (task) {
        try {
          const tags = await db.tags.getForTask(task.id)
          setSelectedTags(tags.map((tag) => tag.id))
        } catch (error) {
          console.error("Error loading task tags:", error)
        }
      }
    }

    loadTaskTags()
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const taskData = {
        title,
        description,
        priority: priority as "low" | "medium" | "high" | "urgent",
        due_date: dueDate ? dueDate.toISOString() : null,
        is_completed: task?.is_completed || false,
      }

      // Submit the task data
      await onSubmit(taskData)

      // If we're editing an existing task, update the tags
      if (task) {
        await db.taskTags.updateTaskTags(task.id, selectedTags)
      }
    } catch (error) {
      console.error("Error submitting task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium mb-1">
            Priority
          </label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                {dueDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-auto"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDueDate(undefined)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? "default" : "outline"}
              className="cursor-pointer"
              style={selectedTags.includes(tag.id) ? { backgroundColor: tag.color, color: "#fff" } : {}}
              onClick={() => toggleTag(tag.id)}
            >
              <div className="flex items-center gap-1">
                {selectedTags.includes(tag.id) && <Checkbox checked className="h-3 w-3 mr-1" />}
                {tag.name}
              </div>
            </Badge>
          ))}
          {availableTags.length === 0 && (
            <p className="text-sm text-gray-500">No tags available. Create some tags first.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : task ? "Update Task" : "Add Task"}
        </Button>
      </div>
    </form>
  )
}

