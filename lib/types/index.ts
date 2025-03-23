export type User = {
  id: string
  email: string
}

export type Task = {
  id: string
  user_id: string
  title: string
  description: string | null
  completed: boolean
  due_date: string | null
  order_index: number
  created_at: string
  tags?: Tag[] // For joined data
}

export type Tag = {
  id: string
  user_id: string
  name: string
  keywords: string[]
  category_id: string | null
  date_range_enabled: boolean
  date_range_start_days: number | null
  date_range_end_days: number | null
  created_at: string
  category?: TagCategory // For joined data
}

export type TagCategory = {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  created_at: string
}

export type SavedFilter = {
  id: string
  user_id: string
  name: string
  created_at: string
  tags?: Tag[] // For joined data
}

export type TimeCategory = {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  order_index: number
  created_at: string
}

export type TaskTag = {
  task_id: string
  tag_id: string
}

export type SavedFilterTag = {
  filter_id: string
  tag_id: string
}

export type TaskTimeCategory = {
  task_id: string
  category_id: string
}

