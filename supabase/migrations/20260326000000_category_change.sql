-- =============================================================
-- カテゴリ変更: 4カテゴリ → 3カテゴリ
-- stock + admin → lifeline / event / help
-- =============================================================

-- 1. 既存データのカテゴリを移行
UPDATE public.posts SET category = 'lifeline' WHERE category IN ('stock', 'admin');

-- 2. CHECK制約を更新
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_category_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_category_check
  CHECK (category IN ('lifeline', 'event', 'help'));
