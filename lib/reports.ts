import { supabase } from "@/lib/supabase";

/** 通報送信 */
export async function createReport(input: {
  target_type: string;
  target_id: string;
  reason: string;
  detail?: string;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase
    .from("reports")
    .insert({ ...input, reporter_id: user.id });
  if (error) throw error;
}
