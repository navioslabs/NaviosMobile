-- 直近7日間の近隣投稿 + トークから頻出タグ上位を返す RPC
-- ユーザーの位置から radius_m 以内の投稿のみ集計
CREATE OR REPLACE FUNCTION public.get_trending_tags(
  user_lat double precision,
  user_lng double precision,
  radius_m integer DEFAULT 5000,
  max_count integer DEFAULT 10
)
RETURNS TABLE(tag text, count bigint) AS $$
  SELECT t.tag, COUNT(*) AS count
  FROM (
    SELECT unnest(tags) AS tag
    FROM public.posts
    WHERE created_at > now() - interval '7 days'
      AND array_length(tags, 1) > 0
      AND location IS NOT NULL
      AND ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
        radius_m
      )
    UNION ALL
    SELECT unnest(tags) AS tag
    FROM public.talks
    WHERE created_at > now() - interval '7 days'
      AND array_length(tags, 1) > 0
      AND location IS NOT NULL
      AND ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
        radius_m
      )
  ) t
  WHERE t.tag <> ''
  GROUP BY t.tag
  ORDER BY count DESC, t.tag
  LIMIT max_count;
$$ LANGUAGE sql STABLE;
