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
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  /** 1回取得 */
  const fetchLocation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGranted(false);
        setError("位置情報の許可が必要です");
        setIsLoading(false);
        return;
      }
      setGranted(true);
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLat(loc.coords.latitude);
      setLng(loc.coords.longitude);
    } catch (e: any) {
      setError(e.message ?? "位置情報の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  /** 継続監視の開始 */
  const startWatching = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGranted(false);
        setError("位置情報の許可が必要です");
        setIsLoading(false);
        return;
      }
      setGranted(true);

      // まず1回取得して初期位置を確定
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLat(loc.coords.latitude);
      setLng(loc.coords.longitude);
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

  return { lat, lng, isLoading, error, granted, isWatching, refresh: fetchLocation };
}
