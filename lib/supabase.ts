import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "SUPABASE_URL と SUPABASE_ANON_KEY を環境変数に設定してください"
  );
}

/** Supabase クライアントインスタンス */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
