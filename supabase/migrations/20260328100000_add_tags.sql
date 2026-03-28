-- ハッシュタグ用 tags カラム追加 (案B: カラム追加型)

-- posts テーブル
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN (tags);

-- talks テーブル
ALTER TABLE talks ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_talks_tags ON talks USING GIN (tags);
