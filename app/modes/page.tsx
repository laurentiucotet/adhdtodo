"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shuffle, Clock, Battery, ArrowRight, Zap, BarChart3, CalendarClock } from "lucide-react"
import Link from "next/link"
import { ModeCard } from "@/components/mode-card"
import { useMobile } from "@/hooks/use-mobile"

export default function ModesPage() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const isMobile = useMobile()

  const modes = [
    {
      id: "wheel",
      name: "Task Wheel",
      description: "Randomly select a task to work on when you can't decide where to start.",
      icon: Shuffle,
      color: "bg-blue-500",
      link: "/wheel",
    },
    {
      id: "two-minute",
      name: "2-Minute Rule",
      description: "Quickly identify and complete tasks that take less than 2 minutes to finish.",
      icon: Zap,
      color: "bg-green-500",
      link: "/modes/two-minute",
    },
    {
      id: "eisenhower",
      name: "Eisenhower Matrix",
      description: "Prioritize tasks based on urgency and importance to focus on what matters most.",
      icon: BarChart3,
      color: "bg-purple-500",
      link: "/modes/eisenhower",
    },
    {
      id: "time-sort",
      name: "Time-Based Sorting",
      description: "Organize tasks into time-based categories with a drag-and-drop card sorting interface.",
      icon: CalendarClock,
      color: "bg-blue-600",
      link: "/modes/time-sort",
    },
    {
      id: "energy",
      name: "Energy Levels",
      description: "Match tasks to your current energy level for optimal productivity throughout the day.",
      icon: Battery,
      color: "bg-amber-500",
      link: "/modes/energy",
    },
    {
      id: "pomodoro",
      name: "Pomodoro Focus",
      description: "Work in focused intervals with the Pomodoro technique to maintain productivity.",
      icon: Clock,
      color: "bg-red-500",
      link: "/modes/pomodoro",
    },
  ]

  return (
    <main className="container mx-auto p-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">Task Selection Modes</h1>
        <p className="text-muted-foreground">
          Choose a productivity method that works best for your current needs and working style.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full mb-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 mb-4">
          <TabsTrigger value="all">All Modes</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="recent">Recently Used</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modes.map((mode) => (
              <ModeCard
                key={mode.id}
                mode={mode}
                onSelect={() => setSelectedMode(mode.id)}
                isSelected={selectedMode === mode.id}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't added any favorites yet.</p>
                <p className="text-sm text-muted-foreground">
                  Mark modes as favorites by clicking the star icon on any mode card.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No recently used modes yet.</p>
                <p className="text-sm text-muted-foreground">
                  Your recently used modes will appear here as you use the application.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedMode && (
        <Card className="border-blue-200 dark:border-blue-800 mb-8">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/30 rounded-t-xl border-b border-blue-100 dark:border-blue-800">
            <CardTitle>Ready to get started?</CardTitle>
            <CardDescription>You've selected the {modes.find((m) => m.id === selectedMode)?.name} mode</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4">
              This mode will help you {modes.find((m) => m.id === selectedMode)?.description.toLowerCase()}
            </p>
          </CardContent>
          <CardFooter className={`${isMobile ? "flex-col space-y-3" : "flex justify-between"}`}>
            <Button variant="outline" onClick={() => setSelectedMode(null)} className={isMobile ? "w-full" : ""}>
              Choose Another Mode
            </Button>
            <Button asChild className={isMobile ? "w-full" : ""}>
              <Link href={modes.find((m) => m.id === selectedMode)?.link || "#"}>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card className="border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="text-xl">Why use different task selection modes?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Different situations call for different approaches to productivity. Our task selection modes are designed
              to help you:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Overcome decision paralysis when you don't know where to start</li>
              <li>Quickly clear small tasks that might be cluttering your mental space</li>
              <li>Focus on high-impact work when you need to make progress on important projects</li>
              <li>Match your tasks to your energy levels throughout the day</li>
              <li>Organize tasks based on when you plan to complete them</li>
              <li>Maintain focus and avoid burnout with structured work intervals</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Try different modes to discover which productivity methods work best for your working style and
              preferences.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

