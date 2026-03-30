import { supabase } from "@/lib/supabase";
import type { Talk, TalkReply } from "@/types";
import { GHOST_DURATION_MS } from "@/constants/ghost";
import { extractTags } from "@/lib/utils";

/** ひとこと一覧取得（24h以内 or 殿堂入り） */
export async function fetchTalks(): Promise<Talk[]> {
  const cutoff = new Date(Date.now() - GHOST_DURATION_MS).toISOString();
  const { data, error } = await supabase
    .from("talks")
    .select("*, author:profiles(*)")
    .or(`is_hall_of_fame.eq.true,created_at.gte.${cutoff}`)
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
  const tags = extractTags(input.message);
  const insertData: Record<string, any> = { ...rest, author_id: user.id, tags };
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

/** ひとことテキスト検索（メッセージ + 位置情報） */
export async function searchTalks(query: string): Promise<Talk[]> {
  const cutoff = new Date(Date.now() - GHOST_DURATION_MS).toISOString();
  const { data, error } = await supabase
    .from("talks")
    .select("*, author:profiles(*)")
    .or(`message.ilike.%${query}%,location_text.ilike.%${query}%`)
    .or(`is_hall_of_fame.eq.true,created_at.gte.${cutoff}`)
    .order("likes_count", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data as Talk[];
}

/** ひとこと削除 */
export async function deleteTalk(id: string): Promise<void> {
  const { error, count } = await supabase.from("talks").delete().eq("id", id);
  if (__DEV__) console.log("deleteTalk:", { id, error, count });
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
