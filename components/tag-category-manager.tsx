"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Save, Trash2, X } from "lucide-react"
import type { TagCategory } from "@/lib/types"
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

interface TagCategoryManagerProps {
  categories: TagCategory[]
  onAddCategory: (name: string, description: string, color: string) => void
  onEditCategory: (categoryId: string, name: string, description: string, color: string) => void
  onDeleteCategory: (categoryId: string) => void
  tagCountByCategory: Record<string, number>
}

export function TagCategoryManager({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  tagCountByCategory,
}: TagCategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryDescription, setNewCategoryDescription] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#3B82F6") // Default blue
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editColor, setEditColor] = useState("")
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName, newCategoryDescription, newCategoryColor)
      setNewCategoryName("")
      setNewCategoryDescription("")
      setNewCategoryColor("#3B82F6")
    }
  }

  const startEditing = (category: TagCategory) => {
    setEditingCategoryId(category.id)
    setEditName(category.name)
    setEditDescription(category.description)
    setEditColor(category.color)
  }

  const saveEdit = () => {
    if (editingCategoryId && editName.trim()) {
      onEditCategory(editingCategoryId, editName, editDescription, editColor)
      setEditingCategoryId(null)
    }
  }

  const cancelEdit = () => {
    setEditingCategoryId(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Category description"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <div className="w-10 h-10 rounded-full" style={{ backgroundColor: newCategoryColor }}></div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddCategory} className="w-full" disabled={!newCategoryName.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Tag Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.length === 0 ? (
              <p className="text-center text-muted-foreground">No categories created yet</p>
            ) : (
              categories.map((category) => (
                <Card key={category.id}>
                  {editingCategoryId === category.id ? (
                    <CardContent className="p-4 space-y-4">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Category name"
                      />
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Category description"
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Category Color</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <div className="w-10 h-10 rounded-full" style={{ backgroundColor: editColor }}></div>
                        </div>
                      </div>
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
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                            <h3 className="font-medium">{category.name}</h3>
                            <Badge variant="outline" className="ml-1">
                              {tagCountByCategory[category.id] || 0} tags
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => startEditing(category)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteCategoryId(category.id)}
                            disabled={category.id === "general"} // Prevent deleting the general category
                          >
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

      <AlertDialog open={deleteCategoryId !== null} onOpenChange={(open) => !open && setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the category. All tags in this category will be moved to the General category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteCategoryId) {
                  onDeleteCategory(deleteCategoryId)
                  setDeleteCategoryId(null)
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

