-- =============================================================
-- Realtime 有効化（talks, talk_replies）
-- =============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.talks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.talk_replies;
