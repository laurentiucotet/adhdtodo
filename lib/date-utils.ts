import type { Tag } from "./types"

/**
 * Calculates the difference in days between two dates
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  // Reset time part for accurate day calculation
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate())
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate())

  // Calculate difference in milliseconds and convert to days
  const diffTime = d2.getTime() - d1.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Determines if a date falls within a tag's date range
 */
export function isDateInTagRange(dueDate: string | null, tag: Tag): boolean {
  if (!dueDate || !tag.dateRange || !tag.dateRange.enabled) {
    return false
  }

  const today = new Date()
  const taskDueDate = new Date(dueDate)
  const daysDifference = getDaysDifference(today, taskDueDate)

  const { startDays, endDays } = tag.dateRange

  // Check if the date falls within the range
  const isAfterStart = startDays === null || daysDifference >= startDays
  const isBeforeEnd = endDays === null || daysDifference <= endDays

  return isAfterStart && isBeforeEnd
}

/**
 * Finds all tags that match a task's due date
 */
export function findMatchingDateRangeTags(dueDate: string | null, tags: Tag[]): string[] {
  if (!dueDate) return []

  return tags.filter((tag) => tag.dateRange?.enabled && isDateInTagRange(dueDate, tag)).map((tag) => tag.id)
}

/**
 * Creates default urgency tags if they don't exist
 */
export function createDefaultUrgencyTags(): Tag[] {
  return [
    {
      id: "tag-asap",
      name: "asap",
      keywords: ["asap", "immediately", "now"],
      dateRange: {
        enabled: true,
        startDays: 0, // Today
        endDays: 0, // Today
      },
    },
    {
      id: "tag-urgent",
      name: "urgent",
      keywords: ["urgent", "important", "priority"],
      dateRange: {
        enabled: true,
        startDays: 1, // Tomorrow
        endDays: 3, // Within 3 days
      },
    },
    {
      id: "tag-soon",
      name: "soon",
      keywords: ["soon", "upcoming", "approaching"],
      dateRange: {
        enabled: true,
        startDays: 4, // 4 days from now
        endDays: 7, // Within a week
      },
    },
    {
      id: "tag-later",
      name: "later",
      keywords: ["later", "future", "eventually"],
      dateRange: {
        enabled: true,
        startDays: 8, // 8+ days from now
        endDays: null, // No end date
      },
    },
  ]
}

