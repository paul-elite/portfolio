-- Everything a new Supabase project needs for the portfolio: the content tables (projects,
-- writings, illustrations, interactions), settings, and the public uploads bucket. Run it once
-- in the Supabase SQL editor; it's safe to run again.
--
-- Columns follow lib/content-adapters.ts (reads) and app/api/admin/content/route.ts (writes).
-- The site reads and writes with the service role key on the server, which bypasses RLS; the
-- policies below only let the public read, so the publishable key can never change content.

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  year TEXT DEFAULT '',
  role TEXT DEFAULT '',
  preview TEXT DEFAULT '',
  preview_images JSONB DEFAULT '[]'::jsonb,
  link TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  blocks JSONB DEFAULT '[]'::jsonb,
  case_study JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS writings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  link TEXT DEFAULT '',
  date TEXT DEFAULT '',
  cover TEXT DEFAULT '',
  blocks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS illustrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  thumbnail TEXT DEFAULT '',
  youtube_url TEXT DEFAULT '',
  category TEXT DEFAULT 'assets',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  link TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE writings ENABLE ROW LEVEL SECURITY;
ALTER TABLE illustrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read" ON projects;
CREATE POLICY "Public read" ON projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read" ON writings;
CREATE POLICY "Public read" ON writings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read" ON illustrations;
CREATE POLICY "Public read" ON illustrations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read" ON interactions;
CREATE POLICY "Public read" ON interactions FOR SELECT USING (true);

-- Settings: one row, created by admin on first save (columns match supabase-schema.sql)
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  name TEXT DEFAULT '',
  title TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  avatar_focused TEXT DEFAULT '',
  twitter TEXT DEFAULT '',
  github TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  behance TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  email TEXT DEFAULT '',
  settings_icon TEXT DEFAULT '',
  settings_icon_selected TEXT DEFAULT '',
  settings_icon_deselected TEXT DEFAULT '',
  navigation_items JSONB DEFAULT '[]'::jsonb,
  favicon_image TEXT DEFAULT '',
  meta_image TEXT DEFAULT '',
  twitter_image TEXT DEFAULT '',
  linkedin_image TEXT DEFAULT '',
  behance_image TEXT DEFAULT '',
  instagram_image TEXT DEFAULT '',
  email_image TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON settings;
CREATE POLICY "Public read" ON settings FOR SELECT USING (true);

-- Uploads: public to read; only the server (service role) uploads, through /api/admin/upload
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Analytics: visits recorded by /api/track. RLS on with no policies, so only the server can
-- read or write them; the public key can't see visitor data.
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  path TEXT NOT NULL DEFAULT '/',
  page_title TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT 'Unknown',
  city TEXT NOT NULL DEFAULT 'Unknown',
  user_agent TEXT NOT NULL DEFAULT 'Unknown',
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  is_repeat BOOLEAN NOT NULL DEFAULT false,
  referrer TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'Direct',
  screen TEXT NOT NULL DEFAULT 'Unknown'
);

CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_visitor_id_idx ON analytics_events (visitor_id);
CREATE INDEX IF NOT EXISTS analytics_events_session_id_idx ON analytics_events (session_id);
CREATE INDEX IF NOT EXISTS analytics_events_path_idx ON analytics_events (path);
CREATE INDEX IF NOT EXISTS analytics_events_source_idx ON analytics_events (source);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow service role analytics access" ON analytics_events;
