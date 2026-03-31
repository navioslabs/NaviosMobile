-- =============================================================
-- get_post_detail: 投稿詳細を距離・座標付きで返す
-- =============================================================

CREATE OR REPLACE FUNCTION public.get_post_detail(
  post_id uuid,
  user_lat double precision DEFAULT 0,
  user_lng double precision DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  author_id uuid,
  category text,
  title text,
  content text,
  image_url text,
  image_urls text[],
  location_text text,
  deadline timestamptz,
  crowd text,
  is_featured boolean,
  likes_count integer,
  comments_count integer,
  tags text[],
  created_at timestamptz,
  updated_at timestamptz,
  distance_m double precision,
  lat double precision,
  lng double precision,
  author_display_name text,
  author_avatar_url text,
  author_is_verified boolean
)
LANGUAGE sql STABLE
AS $$
  SELECT
    p.id,
    p.author_id,
    p.category,
    p.title,
    p.content,
    p.image_url,
    p.image_urls,
    p.location_text,
    p.deadline,
    p.crowd,
    p.is_featured,
    p.likes_count,
    p.comments_count,
    p.tags,
    p.created_at,
    p.updated_at,
    CASE
      WHEN p.location IS NOT NULL AND user_lat != 0 AND user_lng != 0
      THEN ST_Distance(
        p.location,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
      )
      ELSE NULL
    END AS distance_m,
    CASE WHEN p.location IS NOT NULL THEN ST_Y(p.location::geometry) ELSE NULL END AS lat,
    CASE WHEN p.location IS NOT NULL THEN ST_X(p.location::geometry) ELSE NULL END AS lng,
    pr.display_name AS author_display_name,
    pr.avatar_url AS author_avatar_url,
    pr.is_verified AS author_is_verified
  FROM public.posts p
  LEFT JOIN public.profiles pr ON pr.id = p.author_id
  WHERE p.id = post_id;
$$;
