import type { Tag, TagCategory } from "./types"
import type { Task } from "./types"

/**
 * Gets tags by category
 */
export function getTagsByCategory(tags: Tag[], categoryId: string): Tag[] {
  return tags.filter((tag) => tag.category === categoryId)
}

/**
 * Gets a tag by ID
 */
export function getTagById(tags: Tag[], tagId: string): Tag | undefined {
  return tags.find((tag) => tag.id === tagId)
}

/**
 * Gets a category by ID
 */
export function getCategoryById(categories: TagCategory[], categoryId: string): TagCategory | undefined {
  return categories.find((category) => category.id === categoryId)
}

/**
 * Gets tags for the Eisenhower Matrix
 */
export function getEisenhowerTags(tags: Tag[]): {
  urgent: Tag[]
  important: Tag[]
  both: Tag[]
  neither: Tag[]
} {
  const urgencyImportanceTags = tags.filter((tag) => tag.category === "urgency-importance")

  return {
    urgent: urgencyImportanceTags.filter(
      (tag) => tag.name.toLowerCase().includes("urgent") && !tag.name.toLowerCase().includes("important"),
    ),
    important: urgencyImportanceTags.filter(
      (tag) => tag.name.toLowerCase().includes("important") && !tag.name.toLowerCase().includes("urgent"),
    ),
    both: urgencyImportanceTags.filter(
      (tag) => tag.name.toLowerCase().includes("urgent") && tag.name.toLowerCase().includes("important"),
    ),
    neither: urgencyImportanceTags.filter(
      (tag) => !tag.name.toLowerCase().includes("urgent") && !tag.name.toLowerCase().includes("important"),
    ),
  }
}

/**
 * Gets tags for the Time-Based sorting
 */
export function getTimeBasedTags(tags: Tag[]): Tag[] {
  return tags.filter((tag) => tag.category === "time-based")
}

/**
 * Gets tags for the Effort-based sorting
 */
export function getEffortTags(tags: Tag[]): {
  quick: Tag[]
  medium: Tag[]
  high: Tag[]
} {
  const effortTags = tags.filter((tag) => tag.category === "effort")

  return {
    quick: effortTags.filter(
      (tag) => tag.name.toLowerCase().includes("quick") || tag.name.toLowerCase().includes("easy"),
    ),
    medium: effortTags.filter(
      (tag) => tag.name.toLowerCase().includes("medium") || tag.name.toLowerCase().includes("moderate"),
    ),
    high: effortTags.filter(
      (tag) =>
        tag.name.toLowerCase().includes("high") ||
        tag.name.toLowerCase().includes("difficult") ||
        tag.name.toLowerCase().includes("complex"),
    ),
  }
}

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
      if (tag.dateRange?.enabled) {
        const { startDays, endDays } = tag.dateRange
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
 * Update task tags based on Eisenhower Matrix quadrant
 */
export function updateTaskTagsForEisenhower(taskId: string, quadrant: string, tasks: Task[], tags: Tag[]): Task[] {
  const taskIndex = tasks.findIndex((t) => t.id === taskId)
  if (taskIndex === -1) return tasks

  const task = tasks[taskIndex]
  const eisenhowerTags = getEisenhowerTags(tags)

  // Remove existing urgency/importance tags
  const urgencyImportanceTags = tags.filter((tag) => tag.category === "urgency-importance").map((tag) => tag.id)

  const nonEisenhowerTags = task.tags.filter((tagId) => !urgencyImportanceTags.includes(tagId))

  // Add new tags based on quadrant
  let newTags: string[] = []

  switch (quadrant) {
    case "urgent-important":
      newTags =
        eisenhowerTags.both.length > 0
          ? eisenhowerTags.both.map((tag) => tag.id)
          : [...eisenhowerTags.urgent.map((tag) => tag.id), ...eisenhowerTags.important.map((tag) => tag.id)]
      break
    case "not-urgent-important":
      newTags = eisenhowerTags.important.map((tag) => tag.id)
      break
    case "urgent-not-important":
      newTags = eisenhowerTags.urgent.map((tag) => tag.id)
      break
    case "not-urgent-not-important":
      newTags = eisenhowerTags.neither.map((tag) => tag.id)
      break
  }

  // Update the task
  const updatedTask = {
    ...task,
    tags: [...nonEisenhowerTags, ...newTags],
  }

  // Return updated tasks array
  return [...tasks.slice(0, taskIndex), updatedTask, ...tasks.slice(taskIndex + 1)]
}

/**
 * Update task tags based on time category
 */
export function updateTaskTagsForTimeCategory(
  taskId: string,
  categoryId: string,
  tasks: Task[],
  tags: Tag[],
  timeCategories: any[],
): Task[] {
  const taskIndex = tasks.findIndex((t) => t.id === taskId)
  if (taskIndex === -1) return tasks

  const task = tasks[taskIndex]
  const timeBasedTags = getTimeBasedTags(tags)

  // Remove existing time-based tags
  const timeTagIds = timeBasedTags.map((tag) => tag.id)
  const nonTimeBasedTags = task.tags.filter((tagId) => !timeTagIds.includes(tagId))

  // Find the time category
  const category = timeCategories.find((cat) => cat.id === categoryId)
  if (!category) return tasks

  // Find matching time-based tag
  const matchingTag = timeBasedTags.find(
    (tag) =>
      tag.name.toLowerCase() === category.name.toLowerCase() ||
      tag.keywords.some((keyword) => category.name.toLowerCase().includes(keyword.toLowerCase())),
  )

  // Update the task
  const updatedTask = {
    ...task,
    tags: matchingTag ? [...nonTimeBasedTags, matchingTag.id] : nonTimeBasedTags,
  }

  // Return updated tasks array
  return [...tasks.slice(0, taskIndex), updatedTask, ...tasks.slice(taskIndex + 1)]
}

/**
 * Update task tags based on effort level
 */
export function updateTaskTagsForEffort(taskId: string, effortLevel: string, tasks: Task[], tags: Tag[]): Task[] {
  const taskIndex = tasks.findIndex((t) => t.id === taskId)
  if (taskIndex === -1) return tasks

  const task = tasks[taskIndex]
  const effortTags = getEffortTags(tags)

  // Remove existing effort tags
  const effortTagIds = tags.filter((tag) => tag.category === "effort").map((tag) => tag.id)

  const nonEffortTags = task.tags.filter((tagId) => !effortTagIds.includes(tagId))

  // Add new tags based on effort level
  let newTags: string[] = []

  switch (effortLevel) {
    case "quick":
      newTags = effortTags.quick.map((tag) => tag.id)
      break
    case "medium":
      newTags = effortTags.medium.map((tag) => tag.id)
      break
    case "high":
      newTags = effortTags.high.map((tag) => tag.id)
      break
  }

  // Update the task
  const updatedTask = {
    ...task,
    tags: [...nonEffortTags, ...newTags],
  }

  // Return updated tasks array
  return [...tasks.slice(0, taskIndex), updatedTask, ...tasks.slice(taskIndex + 1)]
}

