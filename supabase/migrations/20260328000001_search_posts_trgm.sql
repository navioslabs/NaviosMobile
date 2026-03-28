-- pg_trgm 拡張を有効化（日本語の n-gram 検索に対応）
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- トリグラム GIN インデックス（title, content, location_text）
CREATE INDEX IF NOT EXISTS idx_posts_title_trgm
  ON posts USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_posts_content_trgm
  ON posts USING gin (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_posts_location_text_trgm
  ON posts USING gin (location_text gin_trgm_ops);

-- トリグラム類似度の閾値を下げる（日本語は3文字未満の単語が多いため）
ALTER DATABASE postgres SET pg_trgm.similarity_threshold = 0.1;

-- 全文検索 RPC 関数
CREATE OR REPLACE FUNCTION search_posts_trgm(
  search_query text,
  category_filter text DEFAULT NULL,
  result_limit int DEFAULT 30
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
  likes_count int,
  comments_count int,
  created_at timestamptz,
  updated_at timestamptz,
  distance_m double precision,
  relevance double precision,
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
    p.created_at,
    p.updated_at,
    NULL::double precision AS distance_m,
    GREATEST(
      similarity(p.title, search_query),
      similarity(COALESCE(p.content, ''), search_query),
      similarity(COALESCE(p.location_text, ''), search_query)
    ) AS relevance,
    pr.display_name AS author_display_name,
    pr.avatar_url AS author_avatar_url,
    pr.is_verified AS author_is_verified
  FROM posts p
  LEFT JOIN profiles pr ON pr.id = p.author_id
  WHERE
    (p.deadline IS NULL OR p.deadline > NOW() - INTERVAL '24 hours')
    AND (
      p.title % search_query
      OR COALESCE(p.content, '') % search_query
      OR COALESCE(p.location_text, '') % search_query
      OR p.title ILIKE '%' || search_query || '%'
      OR COALESCE(p.content, '') ILIKE '%' || search_query || '%'
      OR COALESCE(p.location_text, '') ILIKE '%' || search_query || '%'
    )
    AND (category_filter IS NULL OR p.category = category_filter)
  ORDER BY relevance DESC, p.likes_count DESC, p.created_at DESC
  LIMIT result_limit;
$$;
