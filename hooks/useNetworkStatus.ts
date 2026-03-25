import { useEffect, useState } from "react";
import * as Network from "expo-network";

/** ネットワーク接続状態を監視するフック */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        if (mounted) setIsConnected(state.isConnected ?? true);
      } catch {
        // 取得失敗時は接続ありとみなす
      }
    };

    check();
    const interval = setInterval(check, 10000); // 10秒ごとにチェック

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { isConnected };
}
