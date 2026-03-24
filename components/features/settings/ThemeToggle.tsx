import { View, Text, Pressable, StyleSheet } from "react-native";
import { Moon, Sun } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";

interface ThemeToggleProps {
  t: ThemeTokens;
  isDark: boolean;
  onToggle: () => void;
}

/** テーマ切替トグル */
export default function ThemeToggle({ t, isDark, onToggle }: ThemeToggleProps) {
  return (
    <View style={[styles.container, { backgroundColor: t.surface, borderTopColor: t.border, borderBottomColor: t.border }]}>
      <View style={styles.row}>
        <View style={styles.labelRow}>
          {isDark ? <Moon size={18} color={t.purple} /> : <Sun size={18} color="#F5A623" />}
          <Text style={[styles.label, { color: t.text }]}>テーマ</Text>
        </View>
        <Pressable onPress={onToggle} style={[styles.toggle, { backgroundColor: isDark ? t.accent : t.surface3 }]}>
          <View style={[styles.toggleKnob, { backgroundColor: isDark ? "#000" : "#fff", transform: [{ translateX: isDark ? 24 : 2 }] }]}>
            {isDark ? <Moon size={11} color={t.accent} /> : <Sun size={11} color="#F5A623" />}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8, borderTopWidth: 1, borderBottomWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 20 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  label: { fontSize: 15 },
  toggle: { width: 50, height: 28, borderRadius: 99, justifyContent: "center" },
  toggleKnob: { position: "absolute", top: 2, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
});
