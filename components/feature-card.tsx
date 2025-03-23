import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="border-blue-100 dark:border-blue-900 hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full inline-flex">
            <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

