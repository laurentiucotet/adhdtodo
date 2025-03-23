"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DatabaseSetupGuide() {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Database Setup Guide</CardTitle>
        <CardDescription>Follow these steps to set up your Supabase database correctly</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="schema">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="schema">Schema Setup</TabsTrigger>
            <TabsTrigger value="rls">RLS Policies</TabsTrigger>
            <TabsTrigger value="auth">Auth Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="schema" className="mt-4">
            <div className="space-y-4">
              <p>
                To set up your database schema, go to the SQL Editor in your Supabase dashboard and run the SQL script
                provided in the <code>fix-database-schema.sql</code> file.
              </p>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <h3 className="font-bold mb-2">Required Tables:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>users - Extends auth.users with profile information</li>
                  <li>tag_categories - Categories for organizing tags</li>
                  <li>tags - Tags for tasks with keywords for auto-tagging</li>
                  <li>tasks - The main tasks table</li>
                  <li>task_tags - Junction table for task-tag relationships</li>
                  <li>saved_filters - Saved filters for quick access</li>
                  <li>saved_filter_tags - Junction table for filter-tag relationships</li>
                  <li>time_categories - Categories for time-based organization</li>
                  <li>task_time_categories - Junction table for task-time category relationships</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rls" className="mt-4">
            <div className="space-y-4">
              <p>
                Row Level Security (RLS) is crucial for ensuring users can only access their own data. Make sure RLS is
                enabled on all tables with appropriate policies.
              </p>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <h3 className="font-bold mb-2">Key RLS Policies:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Users can only view/edit their own profile</li>
                  <li>Users can only view/edit their own tasks</li>
                  <li>Users can only view/edit their own tags and categories</li>
                  <li>Junction tables should have policies based on the parent tables</li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground">
                The SQL script in <code>fix-database-schema.sql</code> includes all necessary RLS policies.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="auth" className="mt-4">
            <div className="space-y-4">
              <p>Supabase Auth needs to be properly configured to work with your application.</p>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <h3 className="font-bold mb-2">Auth Setup Checklist:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Enable Email/Password sign-in in the Auth settings</li>
                  <li>Set up the correct Site URL in the Auth settings</li>
                  <li>Configure Redirect URLs to include your application URLs</li>
                  <li>
                    Ensure the trigger function <code>handle_new_user</code> is created to insert new users into the
                    users table
                  </li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground">
                The most common issue is that new users aren't being added to the users table when they sign up. The
                trigger function in the SQL script fixes this.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

