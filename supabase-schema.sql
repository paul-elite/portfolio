-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  name TEXT DEFAULT '',
  title TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  twitter TEXT DEFAULT '',
  github TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  behance TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  email TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE IF EXISTS settings
  ADD COLUMN IF NOT EXISTS avatar_focused TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS settings_icon TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS meta_image TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS behance TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS instagram TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS twitter_image TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS linkedin_image TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS behance_image TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS instagram_image TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS email_image TEXT DEFAULT '';

-- Enable Row Level Security (optional but recommended)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read" ON settings
  FOR SELECT USING (true);

-- Create policy to allow authenticated updates (you can adjust this)
CREATE POLICY "Allow service role updates" ON settings
  FOR ALL USING (true);

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to uploads bucket
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

-- Allow authenticated uploads
CREATE POLICY "Allow uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads');

-- Content list avatars
ALTER TABLE IF EXISTS illustrations
  ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '';

ALTER TABLE IF EXISTS interactions
  ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '';
