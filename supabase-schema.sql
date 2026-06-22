-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/pqvbhkyedjrfhwxnczhp/sql/new)

-- 1. Add missing columns to farms table
ALTER TABLE farms
  ADD COLUMN IF NOT EXISTS land_area_value numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS state text DEFAULT '',
  ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS notes text DEFAULT '',
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'IN',
  ADD COLUMN IF NOT EXISTS current_crop text DEFAULT '';

-- 2. Create crops table
CREATE TABLE IF NOT EXISTS crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  sowing_date date,
  expected_harvest_date date,
  season text DEFAULT '',
  area_allocated numeric DEFAULT 0,
  area_unit text DEFAULT 'Hectares',
  growth_stage text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE crops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own crops" ON crops;
CREATE POLICY "Users can manage their own crops"
  ON crops FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  amount numeric NOT NULL DEFAULT 0,
  expense_date date DEFAULT CURRENT_DATE,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own expenses" ON expenses;
CREATE POLICY "Users can manage their own expenses"
  ON expenses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Create income_records table
CREATE TABLE IF NOT EXISTS income_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  crop_id uuid REFERENCES crops(id) ON DELETE SET NULL,
  crop_name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  quantity numeric DEFAULT 0,
  quantity_unit text DEFAULT 'Kg',
  income_date date DEFAULT CURRENT_DATE,
  buyer_name text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own income_records" ON income_records;
CREATE POLICY "Users can manage their own income_records"
  ON income_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- MODULE 4: SMART AGRICULTURE ECOSYSTEM TABLES
-- ============================================================

-- 5. community_posts
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_urls text[] DEFAULT '{}',
  post_type text NOT NULL DEFAULT 'text' CHECK (post_type IN ('text','image','question','success_story','pest_alert','tip')),
  farmer_name text NOT NULL DEFAULT '',
  village text DEFAULT '',
  district text DEFAULT '',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read posts" ON community_posts;
CREATE POLICY "Anyone can read posts"
  ON community_posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create posts" ON community_posts;
CREATE POLICY "Users can create posts"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
CREATE POLICY "Users can update own posts"
  ON community_posts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON community_posts;
CREATE POLICY "Users can delete own posts"
  ON community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- 6. community_comments
CREATE TABLE IF NOT EXISTS community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  farmer_name text NOT NULL DEFAULT '',
  likes_count integer DEFAULT 0,
  is_best_answer boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read comments" ON community_comments;
CREATE POLICY "Anyone can read comments"
  ON community_comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON community_comments;
CREATE POLICY "Users can create comments"
  ON community_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON community_comments;
CREATE POLICY "Users can update own comments"
  ON community_comments FOR UPDATE
  USING (auth.uid() = user_id);

-- 7. government_schemes
CREATE TABLE IF NOT EXISTS government_schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'general',
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  benefits text NOT NULL DEFAULT '',
  eligibility text NOT NULL DEFAULT '',
  website_url text DEFAULT '',
  application_process text NOT NULL DEFAULT '',
  documents_required text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE government_schemes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read schemes" ON government_schemes;
CREATE POLICY "Anyone can read schemes"
  ON government_schemes FOR SELECT
  USING (true);

-- 8. market_prices
CREATE TABLE IF NOT EXISTS market_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name text NOT NULL,
  current_price numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'Quintal',
  daily_change numeric DEFAULT 0,
  yesterday_price numeric DEFAULT 0,
  weekly_trend numeric[] DEFAULT '{}',
  monthly_trend numeric[] DEFAULT '{}',
  market_name text DEFAULT '',
  district text DEFAULT '',
  state text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read market_prices" ON market_prices;
CREATE POLICY "Anyone can read market_prices"
  ON market_prices FOR SELECT
  USING (true);

-- 9. learning_articles
CREATE TABLE IF NOT EXISTS learning_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  reading_time text DEFAULT '5 min',
  cover_image text DEFAULT '',
  article_type text DEFAULT 'article' CHECK (article_type IN ('article','video')),
  video_url text DEFAULT '',
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE learning_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read articles" ON learning_articles;
CREATE POLICY "Anyone can read articles"
  ON learning_articles FOR SELECT
  USING (true);

-- 10. regional_alerts
CREATE TABLE IF NOT EXISTS regional_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('pest','disease','weather','price')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  affected_area text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  recommended_action text NOT NULL DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  farmer_name text DEFAULT '',
  is_verified boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE regional_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read alerts" ON regional_alerts;
CREATE POLICY "Anyone can read alerts"
  ON regional_alerts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create alerts" ON regional_alerts;
CREATE POLICY "Authenticated users can create alerts"
  ON regional_alerts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 11. ai_chats
CREATE TABLE IF NOT EXISTS ai_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid REFERENCES farms(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT 'New Chat',
  message_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own chats" ON ai_chats;
CREATE POLICY "Users can manage their own chats"
  ON ai_chats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 12. chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES ai_chats(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'ai')),
  text text NOT NULL,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own messages" ON chat_messages;
CREATE POLICY "Users can manage their own messages"
  ON chat_messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 13. disease_scans
CREATE TABLE IF NOT EXISTS disease_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid REFERENCES farms(id) ON DELETE SET NULL,
  crop_id uuid REFERENCES crops(id) ON DELETE SET NULL,
  image_url text NOT NULL DEFAULT '',
  disease_name text NOT NULL DEFAULT '',
  confidence text DEFAULT '',
  symptoms text NOT NULL DEFAULT '',
  treatment text NOT NULL DEFAULT '',
  prevention text NOT NULL DEFAULT '',
  severity text DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE disease_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own scans" ON disease_scans;
CREATE POLICY "Users can manage their own scans"
  ON disease_scans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 14. crop_recommendations
CREATE TABLE IF NOT EXISTS crop_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid REFERENCES farms(id) ON DELETE SET NULL,
  input_data jsonb NOT NULL DEFAULT '{}',
  results jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crop_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own recommendations" ON crop_recommendations;
CREATE POLICY "Users can manage their own recommendations"
  ON crop_recommendations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 15. irrigation_advice
CREATE TABLE IF NOT EXISTS irrigation_advice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid REFERENCES farms(id) ON DELETE SET NULL,
  crop text NOT NULL DEFAULT '',
  soil_type text DEFAULT '',
  growth_stage text DEFAULT '',
  action text NOT NULL DEFAULT '',
  reason text NOT NULL DEFAULT '',
  estimated_water text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE irrigation_advice ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own irrigation advice" ON irrigation_advice;
CREATE POLICY "Users can manage their own irrigation advice"
  ON irrigation_advice FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 16. fertilizer_advice
CREATE TABLE IF NOT EXISTS fertilizer_advice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid REFERENCES farms(id) ON DELETE SET NULL,
  crop text NOT NULL DEFAULT '',
  soil_type text DEFAULT '',
  growth_stage text DEFAULT '',
  recommendation text NOT NULL DEFAULT '',
  timing text DEFAULT '',
  organic_alternatives text DEFAULT '',
  nutrients text DEFAULT '',
  disclaimer text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fertilizer_advice ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own fertilizer advice" ON fertilizer_advice;
CREATE POLICY "Users can manage their own fertilizer advice"
  ON fertilizer_advice FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 17. scheme_queries
CREATE TABLE IF NOT EXISTS scheme_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query text NOT NULL DEFAULT '',
  response text NOT NULL DEFAULT '',
  state text DEFAULT '',
  farmer_category text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scheme_queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own scheme queries" ON scheme_queries;
CREATE POLICY "Users can manage their own scheme queries"
  ON scheme_queries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_government_schemes_category ON government_schemes(category);
CREATE INDEX IF NOT EXISTS idx_market_prices_crop ON market_prices(crop_name);
CREATE INDEX IF NOT EXISTS idx_market_prices_state ON market_prices(state);
CREATE INDEX IF NOT EXISTS idx_learning_articles_category ON learning_articles(category);
CREATE INDEX IF NOT EXISTS idx_regional_alerts_type ON regional_alerts(type);
CREATE INDEX IF NOT EXISTS idx_regional_alerts_severity ON regional_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_regional_alerts_area ON regional_alerts(affected_area);

-- 18. smart_alerts
CREATE TABLE IF NOT EXISTS smart_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid REFERENCES farms(id) ON DELETE SET NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('rain','pest','harvest','irrigation','fertilizer','market_price','weather')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  action_required text DEFAULT '',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE smart_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own smart alerts" ON smart_alerts;
CREATE POLICY "Users can manage their own smart alerts"
  ON smart_alerts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_smart_alerts_user ON smart_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_alerts_type ON smart_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_smart_alerts_created ON smart_alerts(created_at DESC);

-- 19. market_advice
CREATE TABLE IF NOT EXISTS market_advice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid REFERENCES farms(id) ON DELETE SET NULL,
  crop_name text NOT NULL DEFAULT '',
  current_price numeric DEFAULT 0,
  demand_level text DEFAULT 'medium' CHECK (demand_level IN ('low','medium','high')),
  best_selling_time text DEFAULT '',
  price_forecast text DEFAULT '',
  demand_forecast text DEFAULT '',
  nearby_markets text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE market_advice ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own market advice" ON market_advice;
CREATE POLICY "Users can manage their own market advice"
  ON market_advice FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_market_advice_user ON market_advice(user_id);
