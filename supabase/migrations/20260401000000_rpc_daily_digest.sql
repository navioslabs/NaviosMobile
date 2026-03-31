-- デイリーダイジェスト用RPC
-- 1回のクエリで今日のサマリーを取得する
CREATE OR REPLACE FUNCTION get_daily_digest(
  p_user_id UUID,
  p_user_lat DOUBLE PRECISION DEFAULT 35.8838,
  p_user_lng DOUBLE PRECISION DEFAULT 139.7906,
  p_radius_m INTEGER DEFAULT 50000
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_point GEOGRAPHY;
BEGIN
  user_point := ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography;

  SELECT json_build_object(
    'today_count', (
      SELECT COUNT(*) FROM posts
      WHERE created_at >= CURRENT_DATE
        AND ST_DWithin(location::geography, user_point, p_radius_m)
    ),
    'yesterday_count', (
      SELECT COUNT(*) FROM posts
      WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
        AND created_at < CURRENT_DATE
        AND ST_DWithin(location::geography, user_point, p_radius_m)
    ),
    'highlights', (
      SELECT COALESCE(json_agg(row_to_json(h)), '[]'::json)
      FROM (
        SELECT p.id, p.title, p.category, p.likes_count, p.comments_count,
               p.image_url, p.location_text, p.created_at,
               pr.display_name AS author_name, pr.avatar_url AS author_avatar
        FROM posts p
        JOIN profiles pr ON pr.id = p.author_id
        WHERE p.created_at >= CURRENT_DATE
          AND ST_DWithin(p.location::geography, user_point, p_radius_m)
        ORDER BY p.likes_count DESC, p.created_at DESC
        LIMIT 3
      ) h
    ),
    'my_stats', (
      SELECT COALESCE(row_to_json(s), '{"post_count":0,"total_likes":0,"total_comments":0}'::json)
      FROM (
        SELECT
          COUNT(*) AS post_count,
          COALESCE(SUM(likes_count), 0) AS total_likes,
          COALESCE(SUM(comments_count), 0) AS total_comments
        FROM posts
        WHERE author_id = p_user_id
          AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      ) s
    ),
    'trending_tags', (
      SELECT COALESCE(json_agg(tt.tag), '[]'::json)
      FROM (
        SELECT UNNEST(tags) AS tag, COUNT(*) AS cnt
        FROM posts
        WHERE created_at >= CURRENT_DATE
          AND ST_DWithin(location::geography, user_point, p_radius_m)
        GROUP BY tag
        ORDER BY cnt DESC
        LIMIT 3
      ) tt
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;
