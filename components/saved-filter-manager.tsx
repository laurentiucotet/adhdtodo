"use client"

import { useState } from "react"
import type { SavedFilter, Tag } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Save, Trash2, X } from "lucide-react"
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

interface SavedFilterManagerProps {
  filters: SavedFilter[]
  tags: Tag[]
  onAddFilter: (name: string, tagIds: string[]) => void
  onEditFilter: (filterId: string, name: string, tagIds: string[]) => void
  onDeleteFilter: (filterId: string) => void
}

export function SavedFilterManager({
  filters,
  tags,
  onAddFilter,
  onEditFilter,
  onDeleteFilter,
}: SavedFilterManagerProps) {
  const [newFilterName, setNewFilterName] = useState("")
  const [newFilterTags, setNewFilterTags] = useState<string[]>([])
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editTags, setEditTags] = useState<string[]>([])
  const [deleteFilterId, setDeleteFilterId] = useState<string | null>(null)

  const handleAddFilter = () => {
    if (newFilterName.trim() && newFilterTags.length > 0) {
      onAddFilter(newFilterName, newFilterTags)
      setNewFilterName("")
      setNewFilterTags([])
    }
  }

  const startEditing = (filter: SavedFilter) => {
    setEditingFilterId(filter.id)
    setEditName(filter.name)
    setEditTags([...filter.tagIds])
  }

  const saveEdit = () => {
    if (editingFilterId && editName.trim() && editTags.length > 0) {
      onEditFilter(editingFilterId, editName, editTags)
      setEditingFilterId(null)
    }
  }

  const cancelEdit = () => {
    setEditingFilterId(null)
  }

  const toggleTagSelection = (tagId: string, isEditing: boolean) => {
    if (isEditing) {
      setEditTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
    } else {
      setNewFilterTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
    }
  }

  const getTagName = (tagId: string) => {
    const tag = tags.find((tag) => tag.id === tagId)
    return tag ? tag.name : tagId
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input placeholder="Filter name" value={newFilterName} onChange={(e) => setNewFilterName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Select tags to include:</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={newFilterTags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTagSelection(tag.id, false)}
                >
                  {tag.name}
                </Badge>
              ))}
              {tags.length === 0 && <span className="text-sm text-muted-foreground">No tags available</span>}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleAddFilter}
            className="w-full"
            disabled={!newFilterName.trim() || newFilterTags.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Filter
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Saved Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filters.length === 0 ? (
              <p className="text-center text-muted-foreground">No saved filters yet</p>
            ) : (
              filters.map((filter) => (
                <Card key={filter.id}>
                  {editingFilterId === filter.id ? (
                    <CardContent className="p-4 space-y-4">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Filter name" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Select tags:</p>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <Badge
                              key={tag.id}
                              variant={editTags.includes(tag.id) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => toggleTagSelection(tag.id, true)}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={cancelEdit}>
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveEdit} disabled={!editName.trim() || editTags.length === 0}>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                      </div>
                    </CardContent>
                  ) : (
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{filter.name}</h3>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {filter.tagIds.map((tagId) => (
                              <Badge key={tagId} variant="secondary" className="text-xs">
                                {getTagName(tagId)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => startEditing(filter)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteFilterId(filter.id)}>
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

      <AlertDialog open={deleteFilterId !== null} onOpenChange={(open) => !open && setDeleteFilterId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will delete the saved filter.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteFilterId) {
                  onDeleteFilter(deleteFilterId)
                  setDeleteFilterId(null)
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

