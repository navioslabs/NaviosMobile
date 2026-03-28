import { useEffect, useState, useRef } from "react";
import * as Location from "expo-location";

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
  /** 継続監視中かどうか */
  isWatching: boolean;
  /** 逆ジオコーディングで取得した地名 */
  placeName: string | null;
  refresh: () => Promise<void>;
}

/** デフォルト座標（越谷駅付近） */
const DEFAULT_LAT = 35.8838;
const DEFAULT_LNG = 139.7906;

/** 現在地を取得するフック */
export function useLocation(options?: LocationOptions): LocationState {
  const watch = options?.watch ?? false;

  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [granted, setGranted] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const lastGeocodeRef = useRef({ lat: 0, lng: 0 });

  /** 逆ジオコーディングで地名を取得（200m以上移動した場合のみ再実行） */
  const reverseGeocode = async (latitude: number, longitude: number) => {
    const dLat = latitude - lastGeocodeRef.current.lat;
    const dLng = longitude - lastGeocodeRef.current.lng;
    const moved = Math.sqrt(dLat * dLat + dLng * dLng) * 111000;
    if (lastGeocodeRef.current.lat !== 0 && moved < 200) return;

    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results.length > 0) {
        const r = results[0];
        const parts = [r.city, r.district, r.street].filter(Boolean);
        setPlaceName(parts.length > 0 ? parts.join(" ") : r.name ?? null);
        lastGeocodeRef.current = { lat: latitude, lng: longitude };
      }
    } catch {
      // 逆ジオコーディング失敗は無視
    }
  };

  /** パーミッション要求を共通化 — 許可されたら true を返す */
  const requestPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setGranted(false);
      setError("位置情報の許可が必要です");
      setIsLoading(false);
      return false;
    }
    setGranted(true);
    return true;
  };

  /** 1回取得 */
  const fetchLocation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!(await requestPermission())) return;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLat(loc.coords.latitude);
      setLng(loc.coords.longitude);
      reverseGeocode(loc.coords.latitude, loc.coords.longitude);
    } catch (e: any) {
      setError(e.message ?? "位置情報の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  /** 継続監視の開始 */
  const startWatching = async () => {
    try {
      if (!(await requestPermission())) return;

      // まず1回取得して初期位置を確定
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLat(loc.coords.latitude);
      setLng(loc.coords.longitude);
      reverseGeocode(loc.coords.latitude, loc.coords.longitude);
      setIsLoading(false);

      // 継続監視を開始
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 50,
          timeInterval: 15000,
        },
        (newLoc) => {
          setLat(newLoc.coords.latitude);
          setLng(newLoc.coords.longitude);
          reverseGeocode(newLoc.coords.latitude, newLoc.coords.longitude);
        }
      );
      subscriptionRef.current = sub;
      setIsWatching(true);
    } catch (e: any) {
      setError(e.message ?? "位置情報の取得に失敗しました");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (watch) {
      startWatching();
    } else {
      fetchLocation();
    }
    return () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      setIsWatching(false);
    };
  }, [watch]);

  return { lat, lng, isLoading, error, granted, isWatching, placeName, refresh: fetchLocation };
}
