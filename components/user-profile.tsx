"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Loader2, User } from "lucide-react"
import { useRouter } from "next/navigation"

export function UserProfile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getProfile() {
      setLoading(true)

      try {
        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/auth/login")
          return
        }

        setUser(session.user)
        setEmail(session.user.email || "")

        // Get user profile
        const { data, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setFullName(data.full_name || "")
          setAvatarUrl(data.avatar_url)
        }
      } catch (error) {
        console.error("Error loading user:", error)
        toast({
          title: "Error",
          description: "Failed to load user profile.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [supabase, router, toast])

  const handleUpdateProfile = async () => {
    if (!user) return

    setUpdating(true)

    try {
      // Update profile
      const updates = {
        id: user.id,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      }

      let newAvatarUrl = avatarUrl

      // Upload avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop()
        const filePath = `${user.id}/avatar.${fileExt}`

        const { error: uploadError, data } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { upsert: true })

        if (uploadError) {
          throw uploadError
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath)

        newAvatarUrl = publicUrl
        updates.avatar_url = publicUrl
      }

      // Update database
      const { error } = await supabase.from("users").upsert(updates)

      if (error) {
        throw error
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })

      setAvatarUrl(newAvatarUrl)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return
    }

    const file = event.target.files[0]
    setAvatarFile(file)

    // Create a preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>Manage your account settings and profile information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl || ""} alt={fullName} />
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="avatar" className="cursor-pointer text-sm text-blue-600 hover:underline">
              Change avatar
            </Label>
            <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">Your email address cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button onClick={handleUpdateProfile} className="w-full" disabled={updating}>
          {updating ? "Updating..." : "Update Profile"}
        </Button>
        <Button variant="outline" onClick={handleSignOut} className="w-full">
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  )
}

