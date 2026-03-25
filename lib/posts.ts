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

  // RPC のフラット結果を Post 型に正規化
  return (data ?? []).map((row: any) => ({
    id: row.id,
    author_id: row.author_id,
    category: row.category,
    title: row.title,
    content: row.content,
    image_url: row.image_url,
    location_text: row.location_text,
    deadline: row.deadline,
    crowd: row.crowd,
    is_featured: row.is_featured,
    likes_count: row.likes_count,
    comments_count: row.comments_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
    distance_m: row.distance_m,
    author: {
      id: row.author_id,
      display_name: row.author_display_name,
      avatar_url: row.author_avatar_url,
      is_verified: row.author_is_verified,
      bio: null,
      location_text: null,
      is_public: true,
      show_location: true,
      show_checkins: false,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
  })) as Post[];
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
  lat?: number;
  lng?: number;
}): Promise<Post> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { lat, lng, ...rest } = input;
  const insertData: Record<string, any> = { ...rest, author_id: user.id };
  if (lat != null && lng != null) {
    insertData.location = `POINT(${lng} ${lat})`;
  }

  const { data, error } = await supabase
    .from("posts")
    .insert(insertData)
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
