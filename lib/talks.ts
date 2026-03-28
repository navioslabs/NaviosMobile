import { supabase } from "@/lib/supabase";
import type { Talk, TalkReply } from "@/types";

/** ひとこと一覧取得 */
export async function fetchTalks(): Promise<Talk[]> {
  const { data, error } = await supabase
    .from("talks")
    .select("*, author:profiles(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Talk[];
}

/** ひとこと詳細 + 返信取得 */
export async function fetchTalkById(
  id: string
): Promise<Talk & { replies: TalkReply[] }> {
  const [talkRes, repliesRes] = await Promise.all([
    supabase
      .from("talks")
      .select("*, author:profiles(*)")
      .eq("id", id)
      .single(),
    supabase
      .from("talk_replies")
      .select("*, author:profiles(*)")
      .eq("talk_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (talkRes.error) throw talkRes.error;
  if (repliesRes.error) throw repliesRes.error;

  return {
    ...(talkRes.data as Talk),
    replies: (repliesRes.data ?? []) as TalkReply[],
  };
}

/** ひとこと投稿 */
export async function createTalk(input: {
  message: string;
  image_url?: string;
  image_urls?: string[];
  location_text?: string;
  lat?: number;
  lng?: number;
}): Promise<Talk> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { lat, lng, ...rest } = input;
  const insertData: Record<string, any> = { ...rest, author_id: user.id };
  if (!insertData.image_url && insertData.image_urls?.length > 0) {
    insertData.image_url = insertData.image_urls[0];
  }
  if (lat != null && lng != null) {
    insertData.location = `POINT(${lng} ${lat})`;
  }

  const { data, error } = await supabase
    .from("talks")
    .insert(insertData)
    .select("*, author:profiles(*)")
    .single();
  if (error) throw error;
  return data as Talk;
}

/** ひとこと削除 */
export async function deleteTalk(id: string): Promise<void> {
  const { error } = await supabase.from("talks").delete().eq("id", id);
  if (error) throw error;
}

/** 返信投稿 */
export async function createTalkReply(
  talkId: string,
  body: string
): Promise<TalkReply> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { data, error } = await supabase
    .from("talk_replies")
    .insert({ talk_id: talkId, author_id: user.id, body })
    .select("*, author:profiles(*)")
    .single();
  if (error) throw error;
  return data as TalkReply;
}
