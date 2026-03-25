-- =============================================================
-- get_nearby_posts: 指定座標から半径内の投稿を距離順で返す
-- =============================================================

CREATE OR REPLACE FUNCTION public.get_nearby_posts(
  user_lat double precision,
  user_lng double precision,
  radius_m integer DEFAULT 5000
)
RETURNS TABLE (
  id uuid,
  author_id uuid,
  category text,
  title text,
  content text,
  image_url text,
  location_text text,
  deadline timestamptz,
  crowd text,
  is_featured boolean,
  likes_count integer,
  comments_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  distance_m double precision,
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
    p.location_text,
    p.deadline,
    p.crowd,
    p.is_featured,
    p.likes_count,
    p.comments_count,
    p.created_at,
    p.updated_at,
    ST_Distance(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) AS distance_m,
    pr.display_name AS author_display_name,
    pr.avatar_url AS author_avatar_url,
    pr.is_verified AS author_is_verified
  FROM public.posts p
  JOIN public.profiles pr ON pr.id = p.author_id
  WHERE p.location IS NOT NULL
    AND ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_m
    )
  ORDER BY distance_m ASC;
$$;
