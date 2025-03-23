"use client"

import { useState } from "react"
import type { Tag, TagCategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Plus, Save, Trash2, X, Calendar } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface TagManagerProps {
  tags: Tag[]
  categories: TagCategory[]
  onAddTag: (name: string, keywords: string[], category: string, dateRange?: Tag["dateRange"]) => void
  onEditTag: (tagId: string, name: string, keywords: string[], category: string, dateRange?: Tag["dateRange"]) => void
  onDeleteTag: (tagId: string) => void
}

export function TagManager({ tags, categories, onAddTag, onEditTag, onDeleteTag }: TagManagerProps) {
  const [newTagName, setNewTagName] = useState("")
  const [newTagKeywords, setNewTagKeywords] = useState("")
  const [newTagCategory, setNewTagCategory] = useState("general") // Default to general category
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editKeywords, setEditKeywords] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null)
  const [filteredCategory, setFilteredCategory] = useState<string | "all">("all")

  // Date range states
  const [dateRangeEnabled, setDateRangeEnabled] = useState(false)
  const [startDays, setStartDays] = useState<string>("")
  const [endDays, setEndDays] = useState<string>("")
  const [editDateRangeEnabled, setEditDateRangeEnabled] = useState(false)
  const [editStartDays, setEditStartDays] = useState<string>("")
  const [editEndDays, setEditEndDays] = useState<string>("")
  const [activeTab, setActiveTab] = useState("basic")

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.name : "Unknown"
  }

  // Get category color by ID
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.color : "#888888"
  }

  // Filter tags by category
  const getFilteredTags = () => {
    if (filteredCategory === "all") {
      return tags
    }
    return tags.filter((tag) => tag.category === filteredCategory)
  }

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const keywords = newTagKeywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k)

      let dateRange = undefined
      if (dateRangeEnabled) {
        dateRange = {
          enabled: true,
          startDays: startDays ? Number.parseInt(startDays, 10) : null,
          endDays: endDays ? Number.parseInt(endDays, 10) : null,
        }
      }

      onAddTag(newTagName, keywords, newTagCategory, dateRange)
      setNewTagName("")
      setNewTagKeywords("")
      setNewTagCategory("general")
      setDateRangeEnabled(false)
      setStartDays("")
      setEndDays("")
      setActiveTab("basic")
    }
  }

  const startEditing = (tag: Tag) => {
    setEditingTagId(tag.id)
    setEditName(tag.name)
    setEditKeywords(tag.keywords.join(", "))
    setEditCategory(tag.category || "general")

    // Set date range values if they exist
    if (tag.dateRange) {
      setEditDateRangeEnabled(tag.dateRange.enabled)
      setEditStartDays(tag.dateRange.startDays !== null ? tag.dateRange.startDays.toString() : "")
      setEditEndDays(tag.dateRange.endDays !== null ? tag.dateRange.endDays.toString() : "")
    } else {
      setEditDateRangeEnabled(false)
      setEditStartDays("")
      setEditEndDays("")
    }
  }

  const saveEdit = () => {
    if (editingTagId && editName.trim()) {
      const keywords = editKeywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k)

      let dateRange = undefined
      if (editDateRangeEnabled) {
        dateRange = {
          enabled: true,
          startDays: editStartDays ? Number.parseInt(editStartDays, 10) : null,
          endDays: editEndDays ? Number.parseInt(editEndDays, 10) : null,
        }
      }

      onEditTag(editingTagId, editName, keywords, editCategory, dateRange)
      setEditingTagId(null)
    }
  }

  const cancelEdit = () => {
    setEditingTagId(null)
  }

  // Format days for display
  const formatDays = (days: number | null): string => {
    if (days === null) return "No limit"
    if (days === 0) return "Today"
    if (days === 1) return "Tomorrow"
    return `${days} days from today`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Tag</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="date-range">Date Range</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Input placeholder="Tag name" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Keywords (comma separated)"
                  value={newTagKeywords}
                  onChange={(e) => setNewTagKeywords(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Keywords are used to automatically tag tasks. Separate with commas.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag-category">Category</Label>
                <Select value={newTagCategory} onValueChange={setNewTagCategory}>
                  <SelectTrigger id="tag-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }}></div>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            <TabsContent value="date-range" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="date-range-toggle" checked={dateRangeEnabled} onCheckedChange={setDateRangeEnabled} />
                <Label htmlFor="date-range-toggle">Enable date-based auto-tagging</Label>
              </div>

              {dateRangeEnabled && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-days">Start (days from today)</Label>
                      <Input
                        id="start-days"
                        type="number"
                        min="0"
                        placeholder="0 = Today"
                        value={startDays}
                        onChange={(e) => setStartDays(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-days">End (days from today)</Label>
                      <Input
                        id="end-days"
                        type="number"
                        min="0"
                        placeholder="Leave empty for no limit"
                        value={endDays}
                        onChange={(e) => setEndDays(e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This tag will be automatically applied to tasks with due dates that fall within this range.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddTag} className="w-full" disabled={!newTagName.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Tags</CardTitle>
          <Select value={filteredCategory} onValueChange={(value) => setFilteredCategory(value as string | "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }}></div>
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getFilteredTags().length === 0 ? (
              <p className="text-center text-muted-foreground">No tags found in this category</p>
            ) : (
              getFilteredTags().map((tag) => (
                <Card key={tag.id}>
                  {editingTagId === tag.id ? (
                    <CardContent className="p-4 space-y-4">
                      <Tabs defaultValue="basic">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="basic">Basic Info</TabsTrigger>
                          <TabsTrigger value="date-range">Date Range</TabsTrigger>
                        </TabsList>
                        <TabsContent value="basic" className="space-y-4 pt-4">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Tag name"
                          />
                          <Input
                            value={editKeywords}
                            onChange={(e) => setEditKeywords(e.target.value)}
                            placeholder="Keywords (comma separated)"
                          />
                          <div className="space-y-2">
                            <Label htmlFor="edit-tag-category">Category</Label>
                            <Select value={editCategory} onValueChange={setEditCategory}>
                              <SelectTrigger id="edit-tag-category">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: category.color }}
                                      ></div>
                                      <span>{category.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TabsContent>
                        <TabsContent value="date-range" className="space-y-4 pt-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`edit-date-range-toggle-${tag.id}`}
                              checked={editDateRangeEnabled}
                              onCheckedChange={setEditDateRangeEnabled}
                            />
                            <Label htmlFor={`edit-date-range-toggle-${tag.id}`}>Enable date-based auto-tagging</Label>
                          </div>

                          {editDateRangeEnabled && (
                            <div className="space-y-4 mt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`edit-start-days-${tag.id}`}>Start (days from today)</Label>
                                  <Input
                                    id={`edit-start-days-${tag.id}`}
                                    type="number"
                                    min="0"
                                    placeholder="0 = Today"
                                    value={editStartDays}
                                    onChange={(e) => setEditStartDays(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`edit-end-days-${tag.id}`}>End (days from today)</Label>
                                  <Input
                                    id={`edit-end-days-${tag.id}`}
                                    type="number"
                                    min="0"
                                    placeholder="Leave empty for no limit"
                                    value={editEndDays}
                                    onChange={(e) => setEditEndDays(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={cancelEdit}>
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveEdit}>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                      </div>
                    </CardContent>
                  ) : (
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{tag.name}</h3>
                            <Badge
                              variant="outline"
                              className="ml-1"
                              style={{
                                backgroundColor: `${getCategoryColor(tag.category)}20`,
                                borderColor: getCategoryColor(tag.category),
                              }}
                            >
                              {getCategoryName(tag.category)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Keywords: {tag.keywords.length > 0 ? tag.keywords.join(", ") : "None"}
                          </p>
                          {tag.dateRange?.enabled && (
                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>
                                {formatDays(tag.dateRange.startDays)} to {formatDays(tag.dateRange.endDays)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => startEditing(tag)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteTagId(tag.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteTagId !== null} onOpenChange={(open) => !open && setDeleteTagId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will delete the tag and remove it from all tasks.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTagId) {
                  onDeleteTag(deleteTagId)
                  setDeleteTagId(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

