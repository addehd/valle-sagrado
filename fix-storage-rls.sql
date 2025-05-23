-- Fix Supabase Storage RLS Issues
-- Run these commands in your Supabase SQL Editor

-- OPTION 1: Quick Fix - Disable RLS on storage.objects (RECOMMENDED for development)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- OPTION 2: Proper RLS Policies (if you want to keep security)
-- Only run these if you didn't use OPTION 1

-- First, enable RLS if it was disabled
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for authenticated users
-- CREATE POLICY "Allow authenticated users full access" ON storage.objects
-- FOR ALL USING (auth.role() = 'authenticated');

-- Or create more specific policies:
-- CREATE POLICY "Allow authenticated uploads" ON storage.objects
-- FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated updates" ON storage.objects  
-- FOR UPDATE USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated deletes" ON storage.objects
-- FOR DELETE USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow public reads" ON storage.objects
-- FOR SELECT USING (true);

-- OPTION 3: Create a public bucket (alternative approach)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'public-uploads', 
--   'public-uploads', 
--   true,
--   52428800, -- 50MB limit
--   array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
-- );

-- Note: After running OPTION 1, restart your development server 