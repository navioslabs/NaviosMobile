import { supabase } from "@/lib/supabase";
import type { Post } from "@/types";
import { DEFAULT_RADIUS } from "@/constants/location";
import { extractTags, haversineDistance } from "@/lib/utils";

const PAGE_SIZE = 20;

/** RPC のフラット行を Post 型に正規化する */
function rowToPost(row: any): Post {
  return {
    id: row.id,
    author_id: row.author_id,
    category: row.category,
    title: row.title,
    content: row.content,
    image_url: row.image_url,
    image_urls: row.image_urls ?? [],
    location_text: row.location_text,
    deadline: row.deadline,
    crowd: row.crowd,
    is_featured: row.is_featured,
    likes_count: row.likes_count,
    comments_count: row.comments_count,
    tags: row.tags ?? [],
    created_at: row.created_at,
    updated_at: row.updated_at,
    distance_m: row.distance_m ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
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
  } as Post;
}

/** フィード一覧取得（RPC優先、フォールバックあり） */
export async function fetchPosts(filters?: {
  category?: string;
  limit?: number;
  createdAfter?: string;
  createdBefore?: string;
  page?: number;
  userLat?: number;
  userLng?: number;
}): Promise<Post[]> {
  const page = filters?.page ?? 0;
  const limit = filters?.limit ?? PAGE_SIZE;
  const uLat = filters?.userLat ?? 0;
  const uLng = filters?.userLng ?? 0;

  // RPC を試行
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_feed_posts", {
    user_lat: uLat,
    user_lng: uLng,
    category_filter: filters?.category && filters.category !== "all" ? filters.category : null,
    created_after: filters?.createdAfter ?? null,
    created_before: filters?.createdBefore ?? null,
    page_offset: page * limit,
    page_limit: limit,
  });

  if (!rpcError && rpcData) {
    return rpcData.map(rowToPost);
  }

  // RPC未デプロイ時のフォールバック: 従来クエリ + クライアント距離計算
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const from = page * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("posts")
    .select("*, author:profiles(*)")
    .or(`deadline.is.null,deadline.gt.${cutoff}`)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const post = row as Post;
    if (post.lat != null && post.lng != null && uLat !== 0 && uLng !== 0) {
      (post as any).distance_m = haversineDistance(uLat, uLng, post.lat, post.lng);
    }
    return post;
  });
}

/** 投稿詳細取得（RPC優先、フォールバックあり） */
export async function fetchPostById(
  id: string,
  userLat = 0,
  userLng = 0,
): Promise<Post> {
  // RPC を試行
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_post_detail", {
    post_id: id,
    user_lat: userLat,
    user_lng: userLng,
  });

  if (!rpcError && rpcData && rpcData.length > 0) {
    return rowToPost(rpcData[0]);
  }

  // RPC未デプロイ時のフォールバック
  const { data, error } = await supabase
    .from("posts")
    .select("*, author:profiles(*)")
    .eq("id", id)
    .single();
  if (error) throw error;

  const post = data as Post;
  // クライアント距離計算（座標がある場合）
  if (post.lat != null && post.lng != null && userLat !== 0 && userLng !== 0) {
    (post as any).distance_m = haversineDistance(userLat, userLng, post.lat, post.lng);
  }
  return post;
}

/** ちかく一覧（PostGIS距離計算） */
export async function fetchNearbyPosts(
  lat: number,
  lng: number,
  radius = DEFAULT_RADIUS
): Promise<Post[]> {
  const { data, error } = await supabase.rpc("get_nearby_posts", {
    user_lat: lat,
    user_lng: lng,
    radius_m: radius,
  });
  if (error) throw error;
  return (data ?? []).map(rowToPost);
}

/** 全文検索（pg_trgm トリグラム類似度 + ILIKE フォールバック） */
export async function searchPosts(query: string, category?: string): Promise<Post[]> {
  const { data, error } = await supabase.rpc("search_posts_trgm", {
    search_query: query,
    category_filter: category ?? null,
    result_limit: 30,
  });
  if (error) throw error;
  return (data ?? []).map(rowToPost);
}

/** 投稿作成 */
export async function createPost(input: {
  category: string;
  title: string;
  content?: string;
  image_url?: string;
  image_urls?: string[];
  location_text?: string;
  deadline?: string;
  lat?: number;
  lng?: number;
}): Promise<Post> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { lat, lng, ...rest } = input;
  const tags = extractTags(`${input.title ?? ""} ${input.content ?? ""}`);
  const insertData: Record<string, any> = { ...rest, author_id: user.id, tags };
  // image_url には1枚目を入れる（後方互換）
  if (!insertData.image_url && insertData.image_urls?.length > 0) {
    insertData.image_url = insertData.image_urls[0];
  }
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
  input: Partial<{
    title: string;
    content: string;
    image_url: string;
    image_urls: string[];
    location_text: string;
    deadline: string;
  }>,
): Promise<Post> {
  const tags = extractTags(`${input.title ?? ""} ${input.content ?? ""}`);
  const { data, error } = await supabase
    .from("posts")
    .update({ ...input, tags })
    .eq("id", id)
    .select("*, author:profiles(*)")
    .single();
  if (error) throw error;
  return data as Post;
}

/** 投稿削除 */
export async function deletePost(id: string): Promise<void> {
  const { error, count } = await supabase.from("posts").delete().eq("id", id);
  if (__DEV__) console.log("deletePost:", { id, error, count });
  if (error) throw error;
}
