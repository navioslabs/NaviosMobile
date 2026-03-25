import { supabase } from "@/lib/supabase";
import type { Post } from "@/types";

/** フィード一覧取得 */
export async function fetchPosts(filters?: {
  category?: string;
  limit?: number;
}): Promise<Post[]> {
  let query = supabase
    .from("posts")
    .select("*, author:profiles(*)")
    .order("created_at", { ascending: false });

  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Post[];
}

/** 投稿詳細取得 */
export async function fetchPostById(id: string): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .select("*, author:profiles(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Post;
}

/** ちかく一覧（PostGIS距離計算） */
export async function fetchNearbyPosts(
  lat: number,
  lng: number,
  radius = 5000
): Promise<Post[]> {
  const { data, error } = await supabase.rpc("get_nearby_posts", {
    user_lat: lat,
    user_lng: lng,
    radius_m: radius,
  });
  if (error) throw error;
  return data as Post[];
}

/** テキスト検索 */
export async function searchPosts(query: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*, author:profiles(*)")
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data as Post[];
}

/** 投稿作成 */
export async function createPost(input: {
  category: string;
  title: string;
  content?: string;
  image_url?: string;
  location_text?: string;
}): Promise<Post> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { data, error } = await supabase
    .from("posts")
    .insert({ ...input, author_id: user.id })
    .select("*, author:profiles(*)")
    .single();
  if (error) throw error;
  return data as Post;
}

/** 投稿更新 */
export async function updatePost(
  id: string,
  input: Partial<{ title: string; content: string; image_url: string; location_text: string }>
): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .update(input)
    .eq("id", id)
    .select("*, author:profiles(*)")
    .single();
  if (error) throw error;
  return data as Post;
}

/** 投稿削除 */
export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}
