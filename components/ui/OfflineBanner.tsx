import { View, Text } from "react-native";
import { WifiOff } from "@/lib/icons";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { SPACE } from "@/lib/styles";

/** オフライン時に画面上部に表示するバナー */
export default function OfflineBanner() {
  const { isConnected } = useNetworkStatus();

  if (isConnected) return null;

  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: SPACE.sm,
      paddingVertical: SPACE.sm,
      backgroundColor: "#FF4D4F",
    }}>
      <WifiOff size={14} color="#fff" />
      <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}>
        オフラインです — ネットワークに接続してください
      </Text>
    </View>
  );
}
