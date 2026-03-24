import { View, Text, Pressable, StyleSheet } from "react-native";
import { Package, Calendar, Users, Building2 } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";

interface QuickActionsProps {
  t: ThemeTokens;
  isDark: boolean;
}

/** クイックアクショングリッド */
export default function QuickActions({ t, isDark }: QuickActionsProps) {
  const actions = [
    { icon: Package, label: "今すぐ買える", dc: t.accent, bg: isDark ? "#0D2B1E" : "#EAF9F4" },
    { icon: Calendar, label: "今日のイベント", dc: "#F5A623", bg: isDark ? "#2D1F0A" : "#FEF6E6" },
    { icon: Users, label: "助けを求めてる人", dc: t.red, bg: isDark ? "#2D0A12" : "#FDEEF0" },
    { icon: Building2, label: "締切が近い手続き", dc: t.purple, bg: isDark ? "#1A0F2D" : "#F0EBFA" },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: t.sub }]}>クイックアクション</Text>
      <View style={styles.grid}>
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <Pressable key={i} style={[styles.card, { backgroundColor: a.bg, borderColor: a.dc + "22" }]}>
              <View style={[styles.iconBox, { backgroundColor: a.dc + "20" }]}>
                <Icon size={17} color={a.dc} />
              </View>
              <Text style={[styles.label, { color: t.text }]}>{a.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 22 },
  heading: { fontSize: 11, fontWeight: "700", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { width: "48%", borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 },
  iconBox: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 12, fontWeight: "600", lineHeight: 16 },
});
