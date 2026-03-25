-- =============================================================
-- NaviOs Initial Schema Migration
-- 地域情報共有モバイルアプリ データベース初期構築
-- =============================================================

-- ----- PostGIS 拡張 -----
CREATE EXTENSION IF NOT EXISTS postgis;

-- =============================================================
-- 1. TABLES
-- =============================================================

-- ----- profiles (auth.users と 1:1) -----
CREATE TABLE public.profiles (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  text        NOT NULL CHECK (char_length(display_name) <= 20),
  avatar_url    text,
  bio           text        CHECK (char_length(bio) <= 150),
  location_text text,
  is_verified   boolean     DEFAULT false,
  is_public     boolean     DEFAULT true,
  show_location boolean     DEFAULT true,
  show_checkins boolean     DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_profiles_display_name ON public.profiles (display_name);

-- ----- posts -----
CREATE TABLE public.posts (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id      uuid        NOT NULL REFERENCES public.profiles(id),
  category       text        NOT NULL CHECK (category IN ('stock','event','help','admin')),
  title          text        NOT NULL,
  content        text,
  image_url      text,
  location       geography(Point, 4326),
  location_text  text,
  deadline       timestamptz,
  crowd          text        CHECK (crowd IN ('crowded','moderate','empty')),
  is_featured    boolean     DEFAULT false,
  likes_count    integer     DEFAULT 0,
  comments_count integer     DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE INDEX idx_posts_author_id   ON public.posts (author_id);
CREATE INDEX idx_posts_category    ON public.posts (category);
CREATE INDEX idx_posts_created_at  ON public.posts (created_at DESC);
CREATE INDEX idx_posts_location    ON public.posts USING GIST (location);
CREATE INDEX idx_posts_deadline    ON public.posts (deadline);

-- ----- talks -----
CREATE TABLE public.talks (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     uuid        NOT NULL REFERENCES public.profiles(id),
  message       text        NOT NULL CHECK (char_length(message) <= 140),
  image_url     text,
  location      geography(Point, 4326),
  location_text text,
  likes_count   integer     DEFAULT 0,
  replies_count integer     DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_talks_author_id  ON public.talks (author_id);
CREATE INDEX idx_talks_created_at ON public.talks (created_at DESC);
CREATE INDEX idx_talks_location   ON public.talks USING GIST (location);

-- ----- comments -----
CREATE TABLE public.comments (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id  uuid        NOT NULL REFERENCES public.profiles(id),
  body       text        NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_comments_post_created ON public.comments (post_id, created_at ASC);

-- ----- talk_replies -----
CREATE TABLE public.talk_replies (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  talk_id     uuid        NOT NULL REFERENCES public.talks(id) ON DELETE CASCADE,
  author_id   uuid        NOT NULL REFERENCES public.profiles(id),
  body        text        NOT NULL,
  likes_count integer     DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_talk_replies_talk_created ON public.talk_replies (talk_id, created_at ASC);

-- ----- likes -----
CREATE TABLE public.likes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id),
  target_type text        NOT NULL CHECK (target_type IN ('post','talk','comment','reply')),
  target_id   uuid        NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX idx_likes_target ON public.likes (target_type, target_id);

-- ----- reports -----
CREATE TABLE public.reports (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid        NOT NULL REFERENCES public.profiles(id),
  target_type text        NOT NULL CHECK (target_type IN ('feed','talk','nearby')),
  target_id   uuid        NOT NULL,
  reason      text        NOT NULL CHECK (reason IN ('spam','inappropriate','misleading','harassment','dangerous','other')),
  detail      text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (reporter_id, target_type, target_id)
);

-- =============================================================
-- 2. ROW LEVEL SECURITY
-- =============================================================

-- ----- profiles RLS -----
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (is_public = true OR auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ----- posts RLS -----
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "posts_insert" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "posts_update" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "posts_delete" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- ----- talks RLS -----
ALTER TABLE public.talks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "talks_select" ON public.talks
  FOR SELECT USING (true);

CREATE POLICY "talks_insert" ON public.talks
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "talks_update" ON public.talks
  FOR UPDATE USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "talks_delete" ON public.talks
  FOR DELETE USING (auth.uid() = author_id);

-- ----- comments RLS -----
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "comments_update" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "comments_delete" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);

-- ----- talk_replies RLS -----
ALTER TABLE public.talk_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "talk_replies_select" ON public.talk_replies
  FOR SELECT USING (true);

CREATE POLICY "talk_replies_insert" ON public.talk_replies
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "talk_replies_update" ON public.talk_replies
  FOR UPDATE USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "talk_replies_delete" ON public.talk_replies
  FOR DELETE USING (auth.uid() = author_id);

-- ----- likes RLS -----
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "likes_insert" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_delete" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- ----- reports RLS -----
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "reports_insert" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- =============================================================
-- 3. TRIGGERS
-- =============================================================

-- ----- handle_new_user: サインアップ時にprofileを自動作成 -----
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'ユーザー'),
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----- update_likes_count: いいね数の自動増減 -----
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'post' THEN
      UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'talk' THEN
      UPDATE public.talks SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'comment' THEN
      -- comments テーブルに likes_count はないため no-op
      NULL;
    ELSIF NEW.target_type = 'reply' THEN
      UPDATE public.talk_replies SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'post' THEN
      UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'talk' THEN
      UPDATE public.talks SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'comment' THEN
      NULL;
    ELSIF OLD.target_type = 'reply' THEN
      UPDATE public.talk_replies SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.target_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_changed
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.update_likes_count();

-- ----- update_comments_count: コメント数の自動増減 -----
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_changed
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();

-- ----- update_replies_count: リプライ数の自動増減 -----
CREATE OR REPLACE FUNCTION public.update_replies_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.talks SET replies_count = replies_count + 1 WHERE id = NEW.talk_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.talks SET replies_count = GREATEST(replies_count - 1, 0) WHERE id = OLD.talk_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reply_changed
  AFTER INSERT OR DELETE ON public.talk_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_replies_count();

-- ----- update_updated_at: updated_at の自動更新 -----
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_posts
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================
-- 4. STORAGE BUCKETS
-- =============================================================

-- アバター画像
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- 投稿画像
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true);

-- トーク画像
INSERT INTO storage.buckets (id, name, public)
VALUES ('talk-images', 'talk-images', true);

-- ----- Storage RLS policies -----

-- avatars: 誰でも閲覧可、認証ユーザーのみアップロード可
CREATE POLICY "avatars_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- post-images: 誰でも閲覧可、認証ユーザーのみアップロード可
CREATE POLICY "post_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "post_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');

CREATE POLICY "post_images_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "post_images_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- talk-images: 誰でも閲覧可、認証ユーザーのみアップロード可
CREATE POLICY "talk_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'talk-images');

CREATE POLICY "talk_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'talk-images' AND auth.role() = 'authenticated');

CREATE POLICY "talk_images_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'talk-images' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'talk-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "talk_images_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'talk-images' AND auth.uid()::text = (storage.foldername(name))[1]);
