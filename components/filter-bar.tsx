"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Tag, SavedFilter, TagCategory } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X, Filter } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FilterBarProps {
  tags: Tag[]
  categories: TagCategory[]
  selectedTags: string[]
  savedFilters: SavedFilter[]
  selectedFilter: string | null
  onTagSelect: (tagId: string) => void
  onFilterSelect: (filterId: string | null) => void
  onAddTag: (name: string, keywords: string[], category: string, dateRange?: Tag["dateRange"]) => void
  onEditTag: (tagId: string, name: string, keywords: string[], category: string, dateRange?: Tag["dateRange"]) => void
}

export function FilterBar({
  tags,
  categories,
  selectedTags,
  savedFilters,
  selectedFilter,
  onTagSelect,
  onFilterSelect,
  onAddTag,
  onEditTag,
}: FilterBarProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all")

  // Get tags by category
  const getTagsByCategory = (categoryId: string) => {
    if (categoryId === "all") return tags
    return tags.filter((tag) => tag.category === categoryId)
  }

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.name : "All Categories"
  }

  // Get category color by ID
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.color : "#888888"
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter tasks
          </CardTitle>
          {selectedTags.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => onFilterSelect(null)} className="h-7 px-2 text-xs">
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {savedFilters.length > 0 && (
          <div className="w-full">
            <Select value={selectedFilter || ""} onValueChange={(value) => onFilterSelect(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Saved filters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                {savedFilters.map((filter) => (
                  <SelectItem key={filter.id} value={filter.id}>
                    {filter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full mb-2 flex flex-nowrap overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }}></div>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  style={
                    !selectedTags.includes(tag.id)
                      ? {
                          borderColor: getCategoryColor(tag.category),
                          backgroundColor: `${getCategoryColor(tag.category)}10`,
                        }
                      : {}
                  }
                  onClick={() => onTagSelect(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
              {tags.length === 0 && <span className="text-sm text-muted-foreground">No tags available</span>}
            </div>
          </TabsContent>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <div className="flex flex-wrap gap-2">
                {getTagsByCategory(category.id).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    style={
                      !selectedTags.includes(tag.id)
                        ? {
                            borderColor: category.color,
                            backgroundColor: `${category.color}10`,
                          }
                        : {}
                    }
                    onClick={() => onTagSelect(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {getTagsByCategory(category.id).length === 0 && (
                  <span className="text-sm text-muted-foreground">No tags in this category</span>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

