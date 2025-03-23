import type { Tag } from "@/lib/types"

/**
 * Auto-tag a task based on its content and due date
 */
export function autoTagTask(title: string, description: string, dueDate: string | null, tags: Tag[]): string[] {
  const content = `${title} ${description}`.toLowerCase()
  const autoTags: string[] = []

  // First, check for keyword-based tags
  tags.forEach((tag) => {
    if (tag.keywords.some((keyword) => content.includes(keyword.toLowerCase()))) {
      autoTags.push(tag.id)
    }
  })

  // Then, check for date-based tags if a due date is provided
  if (dueDate) {
    const today = new Date()
    const taskDueDate = new Date(dueDate)
    const daysDifference = Math.floor((taskDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    tags.forEach((tag) => {
      if (tag.date_range_enabled) {
        const startDays = tag.date_range_start_days
        const endDays = tag.date_range_end_days
        const isAfterStart = startDays === null || daysDifference >= startDays
        const isBeforeEnd = endDays === null || daysDifference <= endDays

        if (isAfterStart && isBeforeEnd) {
          autoTags.push(tag.id)
        }
      }
    })
  }

  return [...new Set(autoTags)] // Remove duplicates
}

/**
 * Gets tags by category
 */
export function getTagsByCategory(tags: Tag[], categoryId: string): Tag[] {
  return tags.filter((tag) => tag.category_id === categoryId)
}

/**
 * Gets a tag by ID
 */
export function getTagById(tags: Tag[], tagId: string): Tag | undefined {
  return tags.find((tag) => tag.id === tagId)
}

