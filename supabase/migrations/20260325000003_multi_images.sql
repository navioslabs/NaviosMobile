-- =============================================================
-- 複数画像対応: image_urls カラム追加
-- =============================================================

-- posts テーブル
ALTER TABLE public.posts ADD COLUMN image_urls text[] DEFAULT '{}';

-- talks テーブル
ALTER TABLE public.talks ADD COLUMN image_urls text[] DEFAULT '{}';
