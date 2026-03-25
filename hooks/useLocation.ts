import { useEffect, useState } from "react";
import * as Location from "expo-location";

interface LocationState {
  /** 緯度 */
  lat: number;
  /** 経度 */
  lng: number;
  /** 読み込み中 */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** 権限が許可されているか */
  granted: boolean;
  /** 位置情報を再取得 */
  refresh: () => Promise<void>;
}

/** デフォルト座標（越谷駅付近） — 位置情報が取れない場合のフォールバック */
const DEFAULT_LAT = 35.8838;
const DEFAULT_LNG = 139.7906;

/** 現在地を取得するフック */
export function useLocation(): LocationState {
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [granted, setGranted] = useState(false);

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

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLat(location.coords.latitude);
      setLng(location.coords.longitude);
    } catch (e: any) {
      setError(e.message ?? "位置情報の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return { lat, lng, isLoading, error, granted, refresh: fetchLocation };
}
