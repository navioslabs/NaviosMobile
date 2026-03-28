import { supabase } from "@/lib/supabase";
import type { StreetHistoryItem } from "@/types";

/** 街の記憶取得（現在地周辺の人気投稿） */
export async function fetchStreetHistory(
  lat: number,
  lng: number,
  radius?: number
): Promise<StreetHistoryItem[]> {
  const { data, error } = await supabase.rpc("get_street_history", {
    user_lat: lat,
    user_lng: lng,
    radius_m: radius ?? 500,
  });
  if (error) throw error;
  return (data ?? []) as StreetHistoryItem[];
}
