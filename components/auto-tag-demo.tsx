"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tag, ArrowRight } from "lucide-react"

// Sample tags with keywords for demo
const DEMO_TAGS = [
  { id: "work", name: "Work", keywords: ["work", "project", "meeting", "deadline", "client"] },
  { id: "personal", name: "Personal", keywords: ["home", "family", "personal", "self"] },
  { id: "urgent", name: "Urgent", keywords: ["urgent", "important", "asap", "soon"] },
  { id: "shopping", name: "Shopping", keywords: ["buy", "purchase", "shop", "store", "grocery"] },
]

export function AutoTagDemo() {
  const [taskInput, setTaskInput] = useState("")
  const [autoTags, setAutoTags] = useState<string[]>([])
  const [hasDemo, setHasDemo] = useState(false)

  // Auto-tag a task based on its content
  const autoTagTask = (title: string): string[] => {
    const content = title.toLowerCase()
    return DEMO_TAGS.filter((tag) => tag.keywords.some((keyword) => content.includes(keyword.toLowerCase()))).map(
      (tag) => tag.id,
    )
  }

  const handleDemoClick = () => {
    const tags = autoTagTask(taskInput)
    setAutoTags(tags)
    setHasDemo(true)
  }

  // Get tag name by ID
  const getTagName = (tagId: string) => {
    const tag = DEMO_TAGS.find((tag) => tag.id === tagId)
    return tag ? tag.name : tagId
  }

  // Get tag color by ID
  const getTagColor = (tagId: string) => {
    switch (tagId) {
      case "work":
        return "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
      case "personal":
        return "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
      case "urgent":
        return "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
      case "shopping":
        return "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
    }
  }

  return (
    <Card className="border-blue-100 dark:border-blue-900">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Try Auto-Tagging</h3>
            <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type a task like 'Meeting with client tomorrow'"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleDemoClick} disabled={!taskInput.trim()}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {hasDemo && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                <p className="font-medium mb-2">Auto-detected tags:</p>
                <div className="flex flex-wrap gap-2">
                  {autoTags.length > 0 ? (
                    autoTags.map((tagId) => (
                      <Badge key={tagId} className={getTagColor(tagId)}>
                        {getTagName(tagId)}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No tags detected. Try using keywords like "work", "urgent", or "shopping".
                    </p>
                  )}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Tip: Try using words like "meeting", "urgent", "family", or "buy" to see different tags.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

