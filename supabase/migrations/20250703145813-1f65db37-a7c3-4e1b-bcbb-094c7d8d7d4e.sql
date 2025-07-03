
-- Create table for user submissions
CREATE TABLE public.user_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  selected_website TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'contacted'))
);

-- Create table for managing betting sites
CREATE TABLE public.betting_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  url TEXT NOT NULL,
  logo_url TEXT,
  button_color TEXT DEFAULT 'green',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for admin users
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'moderator')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.betting_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  );
$$;

-- RLS Policies for user_submissions (admin only)
CREATE POLICY "Admins can view all submissions" 
  ON public.user_submissions 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Admins can update submissions" 
  ON public.user_submissions 
  FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Allow public insert for user submissions" 
  ON public.user_submissions 
  FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for betting_sites
CREATE POLICY "Everyone can view active betting sites" 
  ON public.betting_sites 
  FOR SELECT 
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage betting sites" 
  ON public.betting_sites 
  FOR ALL 
  USING (public.is_admin());

-- RLS Policies for admin_users (admin only)
CREATE POLICY "Admins can view admin users" 
  ON public.admin_users 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Admins can manage admin users" 
  ON public.admin_users 
  FOR ALL 
  USING (public.is_admin());

-- Insert default betting sites
INSERT INTO public.betting_sites (name, display_name, url, button_color) VALUES
('cricindia99', 'cricindia99.com (CricBet99)', 'https://cricindia99.com', 'green'),
('7xmatch', '7xmatch.com (11xplay)', 'https://7xmatch.com', 'red'),
('lagan247', 'lagan247.com (LaserBook)', 'https://lagan247.com', 'purple'),
('lagan365', 'lagan365.com (Lotus365)', 'https://lagan365.com', 'green'),
('reddybook247', 'reddybook247.com (ReddyBook)', 'https://reddybook247.com', 'green'),
('myfair247', 'myfair247.com (Fairplay)', 'https://myfair247.com', 'red');
