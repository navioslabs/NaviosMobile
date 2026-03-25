import { View, Text } from "react-native";
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
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 9999, paddingHorizontal: small ? 6 : 8, paddingVertical: small ? 2 : 3, backgroundColor: c.color + "20" }}>
      <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: c.color }} />
      <Text style={{ fontSize: small ? 10 : 12, fontWeight: "700", letterSpacing: 0.3, color: c.color }}>
        {c.label}
      </Text>
    </View>
  );
}
