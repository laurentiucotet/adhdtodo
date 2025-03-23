-- This script checks and fixes common database schema issues

-- Check if users table exists, create if not
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Check if tag_categories table exists, create if not
CREATE TABLE IF NOT EXISTS public.tag_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if tags table exists, create if not
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES public.tag_categories(id) ON DELETE SET NULL,
  date_range_enabled BOOLEAN DEFAULT FALSE,
  date_range_start_days INTEGER,
  date_range_end_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if tasks table exists, create if not
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if task_tags table exists, create if not
CREATE TABLE IF NOT EXISTS public.task_tags (
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- Check if saved_filters table exists, create if not
CREATE TABLE IF NOT EXISTS public.saved_filters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if saved_filter_tags table exists, create if not
CREATE TABLE IF NOT EXISTS public.saved_filter_tags (
  filter_id UUID REFERENCES public.saved_filters(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (filter_id, tag_id)
);

-- Check if time_categories table exists, create if not
CREATE TABLE IF NOT EXISTS public.time_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if task_time_categories table exists, create if not
CREATE TABLE IF NOT EXISTS public.task_time_categories (
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.time_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, category_id)
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tag_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_filter_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_time_categories ENABLE ROW LEVEL SECURITY;

-- Create or replace RLS policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create or replace function to handle new user creation
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

-- Create trigger for new user creation if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert a test user record if it doesn't exist in the users table
-- This helps with debugging by ensuring there's at least one user record
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users LIMIT 1) THEN
    -- Check if there are any auth users
    IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
      -- Get the first auth user
      INSERT INTO public.users (id, full_name, created_at, updated_at)
      SELECT id, email, now(), now()
      FROM auth.users
      ORDER BY created_at
      LIMIT 1
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END IF;
END
$$;

