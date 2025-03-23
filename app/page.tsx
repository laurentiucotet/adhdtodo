import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ListChecks, Clock, Tag, Brain, ArrowRight, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { FeatureCard } from "@/components/feature-card"
import { AutoTagDemo } from "@/components/auto-tag-demo"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 leading-tight">
            Smart Todo List with <span className="text-blue-700 dark:text-blue-300">Auto-Tagging</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Organize your tasks effortlessly with AI-powered auto-tagging that saves time and streamlines your workflow.
          </p>
          <div className="pt-6">
            <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg">
              <Link href="/tasks">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Auto-tagging Demo */}
      <section className="mb-16">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-blue-600 dark:text-blue-400 mb-4">
              <Brain className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold">How Auto-Tagging Works</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground mt-2">
              Simply add a task, and our smart system automatically analyzes your content and applies relevant tags
              based on keywords.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <AutoTagDemo />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">Why Smart Todo Makes You More Productive</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Clock}
            title="Save Time"
            description="No more manual tagging. Our system automatically categorizes your tasks, saving you valuable time."
          />

          <FeatureCard
            icon={Tag}
            title="Better Organization"
            description="Tasks are automatically organized into relevant categories, making it easier to find what you need."
          />

          <FeatureCard
            icon={ListChecks}
            title="Streamlined Workflow"
            description="Filter tasks by auto-generated tags to focus on what matters most right now."
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">Simple & Effective Task Management</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-blue-100 dark:border-blue-900">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold">Create Tasks Naturally</h3>
                </div>
                <p className="text-muted-foreground">
                  Just write your task as you normally would. No need to think about categories or organization.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 dark:border-blue-900">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <Tag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold">Automatic Organization</h3>
                </div>
                <p className="text-muted-foreground">
                  Our system recognizes keywords and patterns to apply the right tags automatically.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 dark:border-blue-900">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <ListChecks className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold">Filter & Focus</h3>
                </div>
                <p className="text-muted-foreground">
                  Easily filter tasks by tags to focus on specific areas of your life or work.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 dark:border-blue-900">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold">Customizable Intelligence</h3>
                </div>
                <p className="text-muted-foreground">
                  Customize tags and keywords to match your specific needs and vocabulary.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 rounded-2xl p-10 text-white">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Ready to boost your productivity?</h2>
          <p className="text-blue-50">
            Start organizing your tasks smarter, not harder. Our auto-tagging system adapts to your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" variant="secondary" className="rounded-full">
              <Link href="/tasks">Try it now</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10 rounded-full"
            >
              <Link href="/settings">Customize Tags</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

