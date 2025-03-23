export type Task = {
  id: string
  title: string
  description: string
  completed: boolean
  tags: string[]
  createdAt: number
  dueDate: string | null
  order: number
}

export type TagCategory = {
  id: string
  name: string
  description: string
  color: string
}

// Updated Tag type with category
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

export type SavedFilter = {
  id: string
  name: string
  tagIds: string[]
}

// Add TimeCategory type to the shared types file
export interface TimeCategory {
  id: string
  name: string
  color: string
  description: string
  order: number
}

