"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Get all tags for the current user
export async function getTags() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const { data, error } = await supabase
    .from("tags")
    .select("*, category:tag_categories(*)")
    .eq("user_id", session.user.id)

  if (error) {
    console.error("Error fetching tags:", error)
    return []
  }

  return data
}

// Get all tag categories for the current user
export async function getTagCategories() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const { data, error } = await supabase.from("tag_categories").select("*").eq("user_id", session.user.id)

  if (error) {
    console.error("Error fetching tag categories:", error)
    return []
  }

  return data
}

// Create a new tag
export async function createTag(
  name: string,
  keywords: string[],
  categoryId: string,
  dateRangeEnabled = false,
  dateRangeStartDays: number | null = null,
  dateRangeEndDays: number | null = null,
) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const { data, error } = await supabase
    .from("tags")
    .insert({
      user_id: session.user.id,
      name,
      keywords,
      category_id: categoryId,
      date_range_enabled: dateRangeEnabled,
      date_range_start_days: dateRangeStartDays,
      date_range_end_days: dateRangeEndDays,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating tag:", error)
    return null
  }

  revalidatePath("/settings")
  return data
}

// Update a tag
export async function updateTag(
  tagId: string,
  name: string,
  keywords: string[],
  categoryId: string,
  dateRangeEnabled = false,
  dateRangeStartDays: number | null = null,
  dateRangeEndDays: number | null = null,
) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const { data, error } = await supabase
    .from("tags")
    .update({
      name,
      keywords,
      category_id: categoryId,
      date_range_enabled: dateRangeEnabled,
      date_range_start_days: dateRangeStartDays,
      date_range_end_days: dateRangeEndDays,
    })
    .eq("id", tagId)
    .eq("user_id", session.user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating tag:", error)
    return null
  }

  revalidatePath("/settings")
  return data
}

// Delete a tag
export async function deleteTag(tagId: string) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const { error } = await supabase.from("tags").delete().eq("id", tagId).eq("user_id", session.user.id)

  if (error) {
    console.error("Error deleting tag:", error)
    return false
  }

  revalidatePath("/settings")
  return true
}

// Create a new tag category
export async function createTagCategory(name: string, description: string, color: string) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const { data, error } = await supabase
    .from("tag_categories")
    .insert({
      user_id: session.user.id,
      name,
      description,
      color,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating tag category:", error)
    return null
  }

  revalidatePath("/settings")
  return data
}

// Update a tag category
export async function updateTagCategory(categoryId: string, name: string, description: string, color: string) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const { data, error } = await supabase
    .from("tag_categories")
    .update({
      name,
      description,
      color,
    })
    .eq("id", categoryId)
    .eq("user_id", session.user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating tag category:", error)
    return null
  }

  revalidatePath("/settings")
  return data
}

// Delete a tag category
export async function deleteTagCategory(categoryId: string) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  // First, update all tags in this category to the general category
  const { data: generalCategory } = await supabase
    .from("tag_categories")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("name", "General")
    .single()

  if (generalCategory) {
    await supabase
      .from("tags")
      .update({ category_id: generalCategory.id })
      .eq("category_id", categoryId)
      .eq("user_id", session.user.id)
  }

  // Now delete the category
  const { error } = await supabase.from("tag_categories").delete().eq("id", categoryId).eq("user_id", session.user.id)

  if (error) {
    console.error("Error deleting tag category:", error)
    return false
  }

  revalidatePath("/settings")
  return true
}

// Get saved filters
export async function getSavedFilters() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const { data, error } = await supabase
    .from("saved_filters")
    .select("*, saved_filter_tags(tag_id)")
    .eq("user_id", session.user.id)

  if (error) {
    console.error("Error fetching saved filters:", error)
    return []
  }

  // Transform the data
  return data.map((filter: any) => ({
    ...filter,
    tagIds: filter.saved_filter_tags?.map((sft: any) => sft.tag_id) || [],
  }))
}

// Create a saved filter
export async function createSavedFilter(name: string, tagIds: string[]) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  // Insert the filter
  const { data, error } = await supabase
    .from("saved_filters")
    .insert({
      user_id: session.user.id,
      name,
    })
    .select()
    .single()

  if (error || !data) {
    console.error("Error creating saved filter:", error)
    return null
  }

  // Insert the filter-tag relationships
  if (tagIds.length > 0) {
    const filterTags = tagIds.map((tagId) => ({
      filter_id: data.id,
      tag_id: tagId,
    }))

    const { error: relationError } = await supabase.from("saved_filter_tags").insert(filterTags)

    if (relationError) {
      console.error("Error adding tags to filter:", relationError)
    }
  }

  revalidatePath("/settings")
  return data
}

