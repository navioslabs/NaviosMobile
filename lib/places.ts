import Constants from "expo-constants";

const API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY
  ?? process.env.GOOGLE_MAPS_API_KEY
  ?? "";

/** Places Autocomplete の候補 */
export interface PlacePrediction {
  placeId: string;
  /** 場所名（「越谷レイクタウン」等） */
  mainText: string;
  /** 住所補足（「埼玉県越谷市」等） */
  secondaryText: string;
  /** フルテキスト（「越谷レイクタウン, 埼玉県越谷市」） */
  fullText: string;
}

/**
 * Places Autocomplete で場所検索
 * Place Details API は使わない（$17/1000 → $2.83/1000 で済む）
 */
export async function searchPlaces(
  query: string,
  lat?: number,
  lng?: number,
): Promise<PlacePrediction[]> {
  if (!API_KEY || !query.trim()) return [];

  const params = new URLSearchParams({
    input: query,
    key: API_KEY,
    language: "ja",
    components: "country:jp",
  });
  if (lat && lng) {
    params.set("location", `${lat},${lng}`);
    params.set("radius", "50000");
  }

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`,
  );
  const json = await res.json();
  if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
    console.error("Places Autocomplete error:", json.status, json.error_message);
    return [];
  }

  return (json.predictions ?? []).map((p: any) => ({
    placeId: p.place_id,
    mainText: p.structured_formatting?.main_text ?? p.description,
    secondaryText: p.structured_formatting?.secondary_text ?? "",
    fullText: p.description,
  }));
}

/** APIキーが設定されているか */
export function hasGoogleApiKey(): boolean {
  return !!API_KEY && API_KEY.length > 10;
}
