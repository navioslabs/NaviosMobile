import { create } from "zustand";
import * as Location from "expo-location";

interface LocationState {
  lat: number;
  lng: number;
  isLoading: boolean;
  error: string | null;
  granted: boolean;
  isWatching: boolean;
  placeName: string | null;
  /** 1回取得（フィード・投稿作成など） */
  fetchOnce: () => Promise<void>;
  /** 継続監視を開始（ちかく画面用） */
  startWatching: () => Promise<void>;
  /** 継続監視を停止 */
  stopWatching: () => void;
}

/** デフォルト座標（越谷駅付近） */
const DEFAULT_LAT = 35.8838;
const DEFAULT_LNG = 139.7906;

let subscription: Location.LocationSubscription | null = null;
let lastGeocode = { lat: 0, lng: 0 };

/** 逆ジオコーディングで地名を取得（200m以上移動した場合のみ） */
async function reverseGeocode(
  latitude: number,
  longitude: number,
  set: (partial: Partial<LocationState>) => void,
) {
  const dLat = latitude - lastGeocode.lat;
  const dLng = longitude - lastGeocode.lng;
  const moved = Math.sqrt(dLat * dLat + dLng * dLng) * 111000;
  if (lastGeocode.lat !== 0 && moved < 200) return;

  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results.length > 0) {
      const r = results[0];
      const parts = [r.city, r.district, r.street].filter(Boolean);
      set({ placeName: parts.length > 0 ? parts.join(" ") : r.name ?? null });
      lastGeocode = { lat: latitude, lng: longitude };
    }
  } catch {
    // 逆ジオコーディング失敗は無視
  }
}

/** パーミッション要求 — 許可されたら true を返す */
async function requestPermission(
  set: (partial: Partial<LocationState>) => void,
): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    set({ granted: false, error: "位置情報の許可が必要です", isLoading: false });
    return false;
  }
  set({ granted: true });
  return true;
}

/** 位置情報を一元管理するストア */
export const useLocationStore = create<LocationState>((set, get) => ({
  lat: DEFAULT_LAT,
  lng: DEFAULT_LNG,
  isLoading: true,
  error: null,
  granted: false,
  isWatching: false,
  placeName: null,

  fetchOnce: async () => {
    // 既に取得済み（granted かつ isLoading 完了）ならスキップ
    const state = get();
    if (state.granted && !state.isLoading) return;

    set({ isLoading: true, error: null });
    try {
      if (!(await requestPermission(set))) return;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      set({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      reverseGeocode(loc.coords.latitude, loc.coords.longitude, set);
    } catch (e: any) {
      set({ error: e.message ?? "位置情報の取得に失敗しました" });
    } finally {
      set({ isLoading: false });
    }
  },

  startWatching: async () => {
    if (subscription) return; // 既に監視中

    try {
      if (!(await requestPermission(set))) return;

      // まず1回取得して初期位置を確定
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      set({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        isLoading: false,
      });
      reverseGeocode(loc.coords.latitude, loc.coords.longitude, set);

      // 継続監視を開始
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 50,
          timeInterval: 15000,
        },
        (newLoc) => {
          set({ lat: newLoc.coords.latitude, lng: newLoc.coords.longitude });
          reverseGeocode(newLoc.coords.latitude, newLoc.coords.longitude, set);
        },
      );
      set({ isWatching: true });
    } catch (e: any) {
      set({
        error: e.message ?? "位置情報の取得に失敗しました",
        isLoading: false,
      });
    }
  },

  stopWatching: () => {
    subscription?.remove();
    subscription = null;
    set({ isWatching: false });
  },
}));
