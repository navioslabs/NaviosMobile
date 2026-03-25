import { readAsStringAsync, EncodingType } from "expo-file-system/legacy";
import { supabase } from "@/lib/supabase";

/**
 * 画像をSupabase Storageにアップロードする
 * @returns 公開URL
 */
export async function uploadImage(
  bucket: "avatars" | "post-images" | "talk-images",
  uri: string
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
  const fileName = `${user.id}/${crypto.randomUUID()}.${ext}`;

  // ファイルを読み込み
  const base64 = await readAsStringAsync(uri, {
    encoding: EncodingType.Base64,
  });

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, decode(base64), {
      contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
      upsert: false,
    });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

/** 画像削除 */
export async function deleteImage(
  bucket: "avatars" | "post-images" | "talk-images",
  path: string
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

/** Base64 → Uint8Array */
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
