import { View, Text, StyleSheet } from "react-native";
import { CAT_CONFIG, type CategoryId } from "@/constants/categories";

interface CatPillProps {
  cat: CategoryId;
  small?: boolean;
}

/** カテゴリ表示ピル */
export default function CatPill({ cat, small }: CatPillProps) {
  const c = CAT_CONFIG[cat];
  if (!c) return null;
  return (
    <View style={[styles.pill, { backgroundColor: c.color + "20" }, small && styles.pillSmall]}>
      <View style={[styles.dot, { backgroundColor: c.color }]} />
      <Text style={[styles.label, { color: c.color }, small && styles.labelSmall]}>
        {c.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  pillSmall: { paddingHorizontal: 6, paddingVertical: 2 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  label: { fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },
  labelSmall: { fontSize: 9 },
});
