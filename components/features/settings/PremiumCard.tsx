import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Crown } from "@/lib/icons";

/** プレミアムカード */
export default function PremiumCard() {
  return (
    <LinearGradient colors={["#B8700A", "#E8526A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.header}>
        <Crown size={20} color="#fff" />
        <Text style={styles.title}>プレミアム</Text>
      </View>
      <Text style={styles.desc}>広告非表示、優先サポート、全カテゴリ解放</Text>
      <Pressable style={styles.btn}>
        <Text style={styles.btnText}>アップグレード</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { margin: 16, padding: 16, borderRadius: 18 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  title: { color: "#fff", fontSize: 16, fontWeight: "700" },
  desc: { color: "rgba(255,255,255,.8)", fontSize: 12, lineHeight: 18, marginBottom: 12 },
  btn: { width: "100%", padding: 11, backgroundColor: "#fff", borderRadius: 12, alignItems: "center" },
  btnText: { color: "#B8700A", fontWeight: "700", fontSize: 13 },
});
