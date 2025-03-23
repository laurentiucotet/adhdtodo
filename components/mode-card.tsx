"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModeProps {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  link: string
}

interface ModeCardProps {
  mode: ModeProps
  onSelect: () => void
  isSelected: boolean
}

export function ModeCard({ mode, onSelect, isSelected }: ModeCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const Icon = mode.icon

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md cursor-pointer border-2",
        isSelected ? "border-blue-400 dark:border-blue-500" : "border-transparent",
      )}
      onClick={onSelect}
    >
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`${mode.color} p-3 rounded-full`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-yellow-500"
            onClick={(e) => {
              e.stopPropagation()
              setIsFavorite(!isFavorite)
            }}
          >
            <Star className={cn("h-5 w-5", isFavorite && "fill-yellow-500 text-yellow-500")} />
            <span className="sr-only">{isFavorite ? "Remove from favorites" : "Add to favorites"}</span>
          </Button>
        </div>
        <h3 className="font-bold text-lg mb-2">{mode.name}</h3>
        <p className="text-muted-foreground text-sm">{mode.description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={mode.link}>Use This Mode</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

