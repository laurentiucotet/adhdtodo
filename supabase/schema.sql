-- Create schema for Smart Todo App

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Tag categories table
CREATE TABLE IF NOT EXISTS tag_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES tag_categories(id) ON DELETE SET NULL,
  date_range_enabled BOOLEAN DEFAULT FALSE,
  date_range_start_days INTEGER,
  date_range_end_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task-Tag relationship table
CREATE TABLE IF NOT EXISTS task_tags (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- Saved filters table
CREATE TABLE IF NOT EXISTS saved_filters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved filter-tag relationship table
CREATE TABLE IF NOT EXISTS saved_filter_tags (
  filter_id UUID REFERENCES saved_filters(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (filter_id, tag_id)
);

-- Time categories table
CREATE TABLE IF NOT EXISTS time_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task-Time category relationship table
CREATE TABLE IF NOT EXISTS task_time_categories (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  category_id UUID REFERENCES time_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, category_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_filter_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_time_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Tag categories policies
CREATE POLICY "Users can view own tag categories" 
  ON tag_categories FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tag categories" 
  ON tag_categories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tag categories" 
  ON tag_categories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tag categories" 
  ON tag_categories FOR DELETE 
  USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Users can view own tags" 
  ON tags FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tags" 
  ON tags FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" 
  ON tags FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" 
  ON tags FOR DELETE 
  USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" 
  ON tasks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks" 
  ON tasks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" 
  ON tasks FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" 
  ON tasks FOR DELETE 
  USING (auth.uid() = user_id);

-- Task-Tag relationship policies
CREATE POLICY "Users can view own task tags" 
  ON task_tags FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_tags.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own task tags" 
  ON task_tags FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_tags.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own task tags" 
  ON task_tags FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_tags.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

-- Saved filters policies
CREATE POLICY "Users can view own saved filters" 
  ON saved_filters FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved filters" 
  ON saved_filters FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved filters" 
  ON saved_filters FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved filters" 
  ON saved_filters FOR DELETE 
  USING (auth.uid() = user_id);

-- Saved filter-tag relationship policies
CREATE POLICY "Users can view own saved filter tags" 
  ON saved_filter_tags FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM saved_filters 
      WHERE saved_filters.id = saved_filter_tags.filter_id 
      AND saved_filters.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own saved filter tags" 
  ON saved_filter_tags FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM saved_filters 
      WHERE saved_filters.id = saved_filter_tags.filter_id 
      AND saved_filters.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own saved filter tags" 
  ON saved_filter_tags FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM saved_filters 
      WHERE saved_filters.id = saved_filter_tags.filter_id 
      AND saved_filters.user_id = auth.uid()
    )
  );

-- Time categories policies
CREATE POLICY "Users can view own time categories" 
  ON time_categories FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own time categories" 
  ON time_categories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own time categories" 
  ON time_categories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own time categories" 
  ON time_categories FOR DELETE 
  USING (auth.uid() = user_id);

-- Task-Time category relationship policies
CREATE POLICY "Users can view own task time categories" 
  ON task_time_categories FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_time_categories.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own task time categories" 
  ON task_time_categories FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_time_categories.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own task time categories" 
  ON task_time_categories FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_time_categories.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  -- Create default tag categories for new users
  INSERT INTO public.tag_categories (user_id, name, description, color)
  VALUES 
    (new.id, 'General', 'General purpose tags for basic task categorization', '#6B7280'),
    (new.id, 'Time-Based', 'Tags for categorizing tasks based on when they should be completed', '#3B82F6'),
    (new.id, 'Effort', 'Tags for categorizing tasks based on the effort required', '#10B981'),
    (new.id, 'Urgency/Importance', 'Tags for categorizing tasks based on urgency and importance', '#EF4444');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

