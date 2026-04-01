-- フォロー機能テーブル
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- プロフィールにフォロー数カラムを追加
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0;

-- RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- 誰でもフォロー関係を閲覧可能
CREATE POLICY "follows_select" ON public.follows
  FOR SELECT USING (true);

-- 自分のフォローのみ作成可能
CREATE POLICY "follows_insert" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- 自分のフォローのみ削除可能
CREATE POLICY "follows_delete" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- フォロー数を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
    UPDATE public.profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();

-- notifications テーブルに follow タイプを追加
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('like', 'comment', 'reply', 'hall_of_fame', 'follow'));

-- target_type に profile を追加
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_target_type_check;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_target_type_check
  CHECK (target_type IN ('post', 'talk', 'comment', 'profile'));

-- フォロー時に通知を自動作成するトリガー関数
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
DECLARE
  actor_name text;
BEGIN
  SELECT display_name INTO actor_name FROM public.profiles WHERE id = NEW.follower_id;

  INSERT INTO public.notifications (user_id, type, title, body, target_type, target_id, actor_id)
  VALUES (
    NEW.following_id,
    'follow',
    'フォローされました',
    COALESCE(actor_name, 'ユーザー') || 'さんがあなたをフォローしました',
    'profile',
    NEW.follower_id,
    NEW.follower_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_follow_insert
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION create_follow_notification();
