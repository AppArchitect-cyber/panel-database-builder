-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- Create RLS policies for logo uploads
CREATE POLICY "Public can view logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'logos');

CREATE POLICY "Admins can upload logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'logos' AND is_admin());

CREATE POLICY "Admins can update logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'logos' AND is_admin());

CREATE POLICY "Admins can delete logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'logos' AND is_admin());