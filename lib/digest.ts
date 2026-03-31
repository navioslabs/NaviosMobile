import { supabase } from "@/lib/supabase";

export interface DigestHighlight {
  id: string;
  title: string;
  category: string;
  likes_count: number;
  comments_count: number;
  image_url: string | null;
  location_text: string | null;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
}

export interface DailyDigest {
  today_count: number;
  yesterday_count: number;
  highlights: DigestHighlight[];
  my_stats: {
    post_count: number;
    total_likes: number;
    total_comments: number;
  };
  trending_tags: string[];
}

/** 今日のダイジェスト取得（RPC 1回で完結） */
export async function fetchDailyDigest(
  lat: number,
  lng: number
): Promise<DailyDigest> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("get_daily_digest", {
    p_user_id: user?.id ?? "00000000-0000-0000-0000-000000000000",
    p_user_lat: lat,
    p_user_lng: lng,
  });
  if (error) throw error;
  return data as DailyDigest;
}
