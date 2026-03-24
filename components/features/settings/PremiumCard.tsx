import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Crown } from "@/lib/icons";

/** プレミアムカード */
export default function PremiumCard() {
  return (
    <LinearGradient
      colors={["#B8700A", "#E8526A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ marginHorizontal: 16, marginVertical: 12, padding: 16, borderRadius: 18 }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Crown size={22} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>プレミアム</Text>
      </View>
      <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 20, marginBottom: 12 }}>
        広告非表示、優先サポート、全カテゴリ解放
      </Text>
      <Pressable style={{ width: "100%", padding: 12, backgroundColor: "#fff", borderRadius: 12, alignItems: "center" }}>
        <Text style={{ color: "#B8700A", fontWeight: "700", fontSize: 14 }}>アップグレード</Text>
      </Pressable>
    </LinearGradient>
  );
}
