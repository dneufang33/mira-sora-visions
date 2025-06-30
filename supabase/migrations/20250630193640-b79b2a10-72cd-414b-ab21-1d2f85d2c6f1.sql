
-- Create user profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create astrology questionnaire table
CREATE TABLE public.astrology_questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_place TEXT NOT NULL,
  personality_traits TEXT,
  life_goals TEXT,
  additional_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create readings table to store AI-generated content
CREATE TABLE public.readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questionnaire_id UUID NOT NULL REFERENCES astrology_questionnaires(id) ON DELETE CASCADE,
  generated_text TEXT NOT NULL,
  openai_prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create videos table to track D-ID generated videos
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reading_id UUID NOT NULL REFERENCES readings(id) ON DELETE CASCADE,
  did_video_id TEXT,
  video_url TEXT,
  avatar_id TEXT DEFAULT 'amy-jcwCkr1grs',
  status TEXT DEFAULT 'pending',
  duration INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create subscriptions table for Stripe integration
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  plan_name TEXT DEFAULT 'monthly',
  price_amount INTEGER DEFAULT 1999,
  videos_remaining INTEGER DEFAULT 0,
  billing_cycle_start TIMESTAMPTZ,
  billing_cycle_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astrology_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for questionnaires
CREATE POLICY "Users can view own questionnaires" ON public.astrology_questionnaires
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own questionnaires" ON public.astrology_questionnaires
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own questionnaires" ON public.astrology_questionnaires
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for readings
CREATE POLICY "Users can view own readings" ON public.readings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert readings" ON public.readings
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for videos
CREATE POLICY "Users can view own videos" ON public.videos
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert videos" ON public.videos
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update videos" ON public.videos
  FOR UPDATE USING (true);

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can manage subscriptions" ON public.subscriptions
  FOR ALL USING (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.subscriptions (user_id, videos_remaining)
  VALUES (new.id, 0);
  
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
