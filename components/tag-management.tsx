"use client"

import { useState, useEffect } from "react"
import { db, type Tag } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Plus, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function TagManagement() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#3b82f6")
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function loadTags() {
      try {
        setLoading(true)
        const tagsData = await db.tags.getAll()
        setTags(tagsData)
      } catch (error) {
        console.error("Error loading tags:", error)
        toast({
          title: "Error",
          description: "Failed to load tags. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [toast])

  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      toast({
        title: "Error",
        description: "Tag name cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      const newTag = await db.tags.create({
        name: newTagName.trim(),
        color: newTagColor,
      })

      if (newTag) {
        setTags((prev) => [...prev, newTag])
        setNewTagName("")
        setNewTagColor("#3b82f6")
        setIsDialogOpen(false)
        toast({
          title: "Success",
          description: "Tag added successfully",
        })
      }
    } catch (error) {
      console.error("Error adding tag:", error)
      toast({
        title: "Error",
        description: "Failed to add tag. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTag = async () => {
    if (!editingTag || !newTagName.trim()) {
      toast({
        title: "Error",
        description: "Tag name cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedTag = await db.tags.update(editingTag.id, {
        name: newTagName.trim(),
        color: newTagColor,
      })

      if (updatedTag) {
        setTags((prev) => prev.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag)))
        setEditingTag(null)
        setNewTagName("")
        setNewTagColor("#3b82f6")
        setIsDialogOpen(false)
        toast({
          title: "Success",
          description: "Tag updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating tag:", error)
      toast({
        title: "Error",
        description: "Failed to update tag. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTag = async (id: string) => {
    try {
      await db.tags.delete(id)
      setTags((prev) => prev.filter((tag) => tag.id !== id))
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting tag:", error)
      toast({
        title: "Error",
        description: "Failed to delete tag. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openAddDialog = () => {
    setEditingTag(null)
    setNewTagName("")
    setNewTagColor("#3b82f6")
    setIsDialogOpen(true)
  }

  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag)
    setNewTagName(tag.name)
    setNewTagColor(tag.color)
    setIsDialogOpen(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tags</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTag ? "Edit Tag" : "Add New Tag"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="tagName" className="block text-sm font-medium mb-1">
                  Tag Name
                </label>
                <Input
                  id="tagName"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                />
              </div>
              <div>
                <label htmlFor="tagColor" className="block text-sm font-medium mb-1">
                  Tag Color
                </label>
                <div className="flex gap-2">
                  <Input
                    id="tagColor"
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <div className="flex-1 rounded-md" style={{ backgroundColor: newTagColor }}></div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={editingTag ? handleUpdateTag : handleAddTag}>
                  {editingTag ? "Update Tag" : "Add Tag"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p>Loading tags...</p>
      ) : tags.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-gray-500 mb-2">No tags found</p>
            <p className="text-sm text-gray-400">Add a new tag to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <Card key={tag.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }}></div>
                  <span>{tag.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(tag)} className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTag(tag.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

