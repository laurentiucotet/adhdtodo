"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, ChevronDown, ChevronUp, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useMobile } from "@/hooks/use-mobile"

interface AddTaskCardProps {
  onAddTask: (title: string, description: string, dueDate: string | null) => void
}

export function AddTaskCard({ onAddTask }: AddTaskCardProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [isExpanded, setIsExpanded] = useState(false)
  const isMobile = useMobile()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onAddTask(title, description, dueDate ? format(dueDate, "yyyy-MM-dd") : null)
      setTitle("")
      setDescription("")
      setDueDate(undefined)
      if (!isExpanded) {
        setIsExpanded(false)
      }
    }
  }

  return (
    <Card
      className={cn(
        "fixed left-1/2 transform -translate-x-1/2 z-40 shadow-lg w-full max-w-md bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800",
        isMobile ? "bottom-safe-area" : "bottom-6",
      )}
    >
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add a new task..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 touch-target"
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              <span className="sr-only">{isExpanded ? "Show less" : "Show more"}</span>
            </Button>
          </div>

          {isExpanded && (
            <div className="mt-4 space-y-4">
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal touch-target",
                      !dueDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Set due date (optional)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                  {dueDate && (
                    <div className="p-3 border-t border-border">
                      <Button variant="ghost" size="sm" onClick={() => setDueDate(undefined)} className="w-full">
                        Clear date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          )}
        </CardContent>

        <CardFooter className={cn("flex justify-end", !isExpanded && "pt-0")}>
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600 touch-target">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

