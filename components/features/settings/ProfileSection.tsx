import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { User, ChevronRight } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";

interface ProfileSectionProps {
  t: ThemeTokens;
}

/** プロフィールセクション */
export default function ProfileSection({ t }: ProfileSectionProps) {
  return (
    <View style={[styles.container, { backgroundColor: t.surface, borderBottomColor: t.border }]}>
      <View style={styles.row}>
        <LinearGradient colors={[t.accent, t.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
          <User size={24} color="#fff" />
        </LinearGradient>
        <View style={styles.info}>
          <Text style={[styles.name, { color: t.text }]}>ゲストユーザー</Text>
          <Text style={[styles.sub, { color: t.sub }]}>プロフィールを設定</Text>
        </View>
        <ChevronRight size={18} color={t.muted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, borderBottomWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: "700" },
  sub: { fontSize: 12, marginTop: 2 },
});
