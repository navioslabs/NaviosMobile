-- =============================================
-- Ghost Posts + Local Legend + Street History
-- =============================================

-- ===== Feature 1: ゴースト投稿 =====

ALTER TABLE public.talks
  ADD COLUMN is_hall_of_fame boolean DEFAULT false;

CREATE INDEX idx_talks_hall_of_fame ON public.talks (is_hall_of_fame)
  WHERE is_hall_of_fame = true;

-- いいねが10に達したら殿堂入り
CREATE OR REPLACE FUNCTION public.check_hall_of_fame()
RETURNS trigger AS $$
BEGIN
  IF NEW.target_type = 'talk' THEN
    UPDATE public.talks
    SET is_hall_of_fame = true
    WHERE id = NEW.target_id
      AND is_hall_of_fame = false
      AND likes_count >= 10;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_check_hall_of_fame
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.check_hall_of_fame();


-- ===== Feature 2: 街の記憶 RPC =====

CREATE OR REPLACE FUNCTION public.get_street_history(
  user_lat double precision,
  user_lng double precision,
  radius_m integer DEFAULT 500,
  page_limit integer DEFAULT 50,
  page_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  item_type text,
  author_id uuid,
  title text,
  message text,
  image_url text,
  location_text text,
  likes_count integer,
  created_at timestamptz,
  author_display_name text,
  author_avatar_url text,
  author_is_verified boolean
)
LANGUAGE sql STABLE
AS $$
  (
    SELECT
      t.id, 'talk'::text, t.author_id, NULL::text, t.message, t.image_url,
      t.location_text, t.likes_count, t.created_at,
      pr.display_name, pr.avatar_url, pr.is_verified
    FROM public.talks t
    JOIN public.profiles pr ON pr.id = t.author_id
    WHERE t.is_hall_of_fame = true
      AND t.location IS NOT NULL
      AND ST_DWithin(
        t.location,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
        radius_m
      )
  )
  UNION ALL
  (
    SELECT
      p.id, 'post'::text, p.author_id, p.title, NULL::text, p.image_url,
      p.location_text, p.likes_count, p.created_at,
      pr.display_name, pr.avatar_url, pr.is_verified
    FROM public.posts p
    JOIN public.profiles pr ON pr.id = p.author_id
    WHERE p.likes_count >= 5
      AND p.location IS NOT NULL
      AND ST_DWithin(
        p.location,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
        radius_m
      )
  )
  ORDER BY created_at DESC
  LIMIT page_limit OFFSET page_offset;
$$;


-- ===== Feature 3: ローカルレジェンド =====

CREATE TABLE public.user_badges (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type text        NOT NULL CHECK (badge_type IN ('resident', 'face', 'legend')),
  area_name  text        NOT NULL,
  earned_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, badge_type, area_name)
);

CREATE INDEX idx_user_badges_user ON public.user_badges (user_id);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_badges_select" ON public.user_badges
  FOR SELECT USING (true);

-- INSERT/UPDATE は SECURITY DEFINER の RPC のみ
CREATE POLICY "user_badges_no_direct_insert" ON public.user_badges
  FOR INSERT WITH CHECK (false);

CREATE POLICY "user_badges_no_direct_update" ON public.user_badges
  FOR UPDATE USING (false);

CREATE POLICY "user_badges_no_direct_delete" ON public.user_badges
  FOR DELETE USING (false);


-- バッジ再計算 RPC
CREATE OR REPLACE FUNCTION public.refresh_user_badges(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  area RECORD;
BEGIN
  FOR area IN
    SELECT
      location_text AS area_name,
      COUNT(*) AS post_count,
      COALESCE(SUM(likes_count), 0) AS total_likes
    FROM (
      SELECT location_text, likes_count FROM public.posts
      WHERE author_id = target_user_id AND location_text IS NOT NULL
      UNION ALL
      SELECT location_text, likes_count FROM public.talks
      WHERE author_id = target_user_id AND location_text IS NOT NULL
    ) combined
    GROUP BY location_text
  LOOP
    -- Legend: 100+ posts in area
    IF area.post_count >= 100 THEN
      INSERT INTO public.user_badges (user_id, badge_type, area_name)
      VALUES (target_user_id, 'legend', area.area_name)
      ON CONFLICT (user_id, badge_type, area_name) DO NOTHING;
    END IF;

    -- Face: 50+ likes in area
    IF area.total_likes >= 50 THEN
      INSERT INTO public.user_badges (user_id, badge_type, area_name)
      VALUES (target_user_id, 'face', area.area_name)
      ON CONFLICT (user_id, badge_type, area_name) DO NOTHING;
    END IF;

    -- Resident: 10+ posts in area
    IF area.post_count >= 10 THEN
      INSERT INTO public.user_badges (user_id, badge_type, area_name)
      VALUES (target_user_id, 'resident', area.area_name)
      ON CONFLICT (user_id, badge_type, area_name) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;


-- トップバッジ取得 RPC
CREATE OR REPLACE FUNCTION public.get_user_top_badge(target_user_id uuid)
RETURNS TABLE (badge_type text, area_name text)
LANGUAGE sql STABLE
AS $$
  SELECT badge_type, area_name
  FROM public.user_badges
  WHERE user_id = target_user_id
  ORDER BY
    CASE badge_type
      WHEN 'legend' THEN 3
      WHEN 'face' THEN 2
      WHEN 'resident' THEN 1
    END DESC
  LIMIT 1;
$$;
