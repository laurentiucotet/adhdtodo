"use client"

import type { Tag } from "./todo-app"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TagFilterProps {
  tags: Tag[]
  selectedTags: string[]
  onTagSelect: (tagId: string) => void
}

export function TagFilter({ tags, selectedTags, onTagSelect }: TagFilterProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Filter by tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onTagSelect(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
          {tags.length === 0 && <span className="text-sm text-muted-foreground">No tags available</span>}
        </div>
      </CardContent>
    </Card>
  )
}

