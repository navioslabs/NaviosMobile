import { useEffect } from "react";
import { useLocationStore } from "@/stores/locationStore";

interface LocationOptions {
  /** 継続監視モード（ちかく画面用） */
  watch?: boolean;
}

interface LocationState {
  lat: number;
  lng: number;
  isLoading: boolean;
  error: string | null;
  granted: boolean;
  isWatching: boolean;
  placeName: string | null;
  refresh: () => Promise<void>;
}

/**
 * 位置情報フック — locationStore のラッパー
 * GPS アクセスはストアに集約し、各画面は読み取るだけ
 */
export function useLocation(options?: LocationOptions): LocationState {
  const watch = options?.watch ?? false;
  const store = useLocationStore();

  useEffect(() => {
    if (watch) {
      store.startWatching();
      return () => store.stopWatching();
    }
    // 1回取得（未取得の場合のみ実行される）
    store.fetchOnce();
  }, [watch]);

  return {
    lat: store.lat,
    lng: store.lng,
    isLoading: store.isLoading,
    error: store.error,
    granted: store.granted,
    isWatching: store.isWatching,
    placeName: store.placeName,
    refresh: store.fetchOnce,
  };
}
