import { View, Text, StyleSheet } from "react-native";
import { Radio, Eye } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";

interface ScanHeaderProps {
  t: ThemeTokens;
  isDark: boolean;
  postCount: number;
}

/** スキャンヘッダー */
export default function ScanHeader({ t, isDark, postCount }: ScanHeaderProps) {
  return (
    <View style={[styles.container, { backgroundColor: isDark ? "rgba(0,212,161,0.05)" : "rgba(0,212,161,0.07)", borderBottomColor: t.border }]}>
      <View style={styles.inner}>
        <View style={[styles.iconBox, { backgroundColor: t.accent + "18" }]}>
          <Radio size={20} color={t.accent} />
        </View>
        <View style={styles.textCol}>
          <Text style={[styles.title, { color: t.text }]}>周辺をスキャン中</Text>
          <Text style={[styles.sub, { color: t.sub }]}>{postCount}件のイベントを検出 • 越谷市周辺</Text>
        </View>
        <View style={[styles.liveBadge, { backgroundColor: t.accent }]}>
          <Eye size={12} color="#000" />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
  inner: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBox: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  textCol: { flex: 1 },
  title: { fontSize: 14, fontWeight: "700" },
  sub: { fontSize: 11, marginTop: 2 },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  liveText: { color: "#000", fontSize: 11, fontWeight: "800" },
});
