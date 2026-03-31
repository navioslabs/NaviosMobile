import { readAsStringAsync, EncodingType } from "expo-file-system/legacy";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";

/** バケット別のリサイズ上限 */
const MAX_SIZE: Record<string, number> = {
  avatars: 400,
  "post-images": 1200,
  "talk-images": 1200,
};

/**
 * 画像をリサイズする（アスペクト比維持、長辺を maxSize 以下に）
 * 元が maxSize 以下ならそのまま返す
 */
async function resizeImage(uri: string, maxSize: number): Promise<string> {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: maxSize } }],
    { compress: 0.7, format: SaveFormat.JPEG }
  );
  return result.uri;
}

/**
 * 画像をSupabase Storageにアップロードする
 * アップロード前に自動リサイズ（長辺 maxSize 以下、JPEG 0.7圧縮）
 * @returns 公開URL
 */
export async function uploadImage(
  bucket: "avatars" | "post-images" | "talk-images",
  uri: string
): Promise<string> {
  // 認証取得とリサイズを並列実行
  const maxSize = MAX_SIZE[bucket] ?? 1200;
  const [{ data: { user } }, resizedUri] = await Promise.all([
    supabase.auth.getUser(),
    resizeImage(uri, maxSize),
  ]);
  if (!user) throw new Error("ログインが必要です");

  const fileName = `${user.id}/${uuidv4()}.jpg`;

  const base64 = await readAsStringAsync(resizedUri, {
    encoding: EncodingType.Base64,
  });

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, decode(base64), {
      contentType: "image/jpeg",
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
