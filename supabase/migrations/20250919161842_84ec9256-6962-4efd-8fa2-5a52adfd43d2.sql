-- Ensure settings table has proper RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies for settings table
CREATE POLICY "Everyone can read settings" 
ON public.settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage settings" 
ON public.settings 
FOR ALL 
USING (is_admin());