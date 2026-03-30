-- コメント通知を拡張：投稿者 + 同じ投稿にコメントした他のユーザーにも通知
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  target_author_id uuid;
  target_title text;
  actor_name text;
  commenter record;
BEGIN
  SELECT author_id, title INTO target_author_id, target_title
  FROM public.posts WHERE id = NEW.post_id;

  SELECT display_name INTO actor_name FROM public.profiles WHERE id = NEW.author_id;

  -- 投稿者に通知（自分自身は除く）
  IF target_author_id IS NOT NULL AND target_author_id != NEW.author_id THEN
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
  END IF;

  -- 同じ投稿にコメントした他のユーザーにも通知（投稿者・自分自身は除く）
  FOR commenter IN
    SELECT DISTINCT author_id
    FROM public.comments
    WHERE post_id = NEW.post_id
      AND author_id != NEW.author_id
      AND author_id != COALESCE(target_author_id, '00000000-0000-0000-0000-000000000000')
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body, target_type, target_id, actor_id)
    VALUES (
      commenter.author_id,
      'reply',
      '返信がつきました',
      COALESCE(actor_name, 'ユーザー') || 'さんも「' || COALESCE(target_title, '投稿') || '」にコメントしました',
      'post',
      NEW.post_id,
      NEW.author_id
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Talk返信の通知トリガーを追加
CREATE OR REPLACE FUNCTION create_reply_notification()
RETURNS TRIGGER AS $$
DECLARE
  target_author_id uuid;
  target_message text;
  actor_name text;
BEGIN
  SELECT author_id, LEFT(message, 30) INTO target_author_id, target_message
  FROM public.talks WHERE id = NEW.talk_id;

  IF target_author_id IS NULL OR target_author_id = NEW.author_id THEN
    RETURN NEW;
  END IF;

  SELECT display_name INTO actor_name FROM public.profiles WHERE id = NEW.author_id;

  INSERT INTO public.notifications (user_id, type, title, body, target_type, target_id, actor_id)
  VALUES (
    target_author_id,
    'reply',
    '返信がつきました',
    COALESCE(actor_name, 'ユーザー') || 'さんが「' || COALESCE(target_message, 'ひとこと') || '」に返信しました',
    'talk',
    NEW.talk_id,
    NEW.author_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reply_insert
  AFTER INSERT ON public.talk_replies
  FOR EACH ROW
  EXECUTE FUNCTION create_reply_notification();
