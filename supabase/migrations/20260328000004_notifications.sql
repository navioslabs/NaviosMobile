-- アプリ内通知テーブル
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('like', 'comment', 'reply', 'hall_of_fame')),
  title text NOT NULL,
  body text NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('post', 'talk', 'comment')),
  target_id uuid NOT NULL,
  actor_id uuid REFERENCES public.profiles(id),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Realtime 有効化
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- いいね時に通知を自動作成するトリガー関数
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  target_author_id uuid;
  target_title text;
  actor_name text;
BEGIN
  -- 投稿/トークの作者を取得
  IF NEW.target_type = 'post' THEN
    SELECT author_id, title INTO target_author_id, target_title
    FROM public.posts WHERE id = NEW.target_id;
  ELSIF NEW.target_type = 'talk' THEN
    SELECT author_id, message INTO target_author_id, target_title
    FROM public.talks WHERE id = NEW.target_id;
    target_title := LEFT(target_title, 30);
  END IF;

  -- 自分自身へのいいねは通知しない
  IF target_author_id IS NULL OR target_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT display_name INTO actor_name FROM public.profiles WHERE id = NEW.user_id;

  INSERT INTO public.notifications (user_id, type, title, body, target_type, target_id, actor_id)
  VALUES (
    target_author_id,
    'like',
    'いいねされました',
    COALESCE(actor_name, 'ユーザー') || 'さんが「' || COALESCE(target_title, '投稿') || '」にいいねしました',
    NEW.target_type,
    NEW.target_id,
    NEW.user_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_insert
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION create_like_notification();

-- コメント時に通知を自動作成するトリガー関数
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  target_author_id uuid;
  target_title text;
  actor_name text;
BEGIN
  SELECT author_id, title INTO target_author_id, target_title
  FROM public.posts WHERE id = NEW.post_id;

  IF target_author_id IS NULL OR target_author_id = NEW.author_id THEN
    RETURN NEW;
  END IF;

  SELECT display_name INTO actor_name FROM public.profiles WHERE id = NEW.author_id;

  INSERT INTO public.notifications (user_id, type, title, body, target_type, target_id, actor_id)
  VALUES (
    target_author_id,
    'comment',
    'コメントがつきました',
    COALESCE(actor_name, 'ユーザー') || 'さんが「' || COALESCE(target_title, '投稿') || '」にコメントしました',
    'post',
    NEW.post_id,
    NEW.author_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_insert
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION create_comment_notification();
