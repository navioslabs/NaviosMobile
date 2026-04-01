-- 期限切れ投稿のクリーンアップ関数
-- deadline から7日以上経過した投稿を削除する
-- 関連する comments, likes は ON DELETE CASCADE で自動削除される
CREATE OR REPLACE FUNCTION cleanup_expired_posts()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  WITH deleted AS (
    DELETE FROM public.posts
    WHERE deadline IS NOT NULL
      AND deadline < now() - interval '7 days'
    RETURNING id
  )
  SELECT count(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- pg_cron で毎日午前4時（JST）に実行
-- Supabase ダッシュボード > Database > Extensions で pg_cron を有効化した上で実行
-- SELECT cron.schedule(
--   'cleanup-expired-posts',
--   '0 19 * * *',           -- UTC 19:00 = JST 04:00
--   $$SELECT cleanup_expired_posts()$$
-- );
