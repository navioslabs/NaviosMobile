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
    <View
      className={`flex-row items-center gap-[3px] rounded-pill ${small ? "px-1.5 py-0.5" : "px-2 py-[3px]"}`}
      style={{ backgroundColor: c.color + "20" }}
    >
      <View className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: c.color }} />
      <Text
        style={{ fontSize: small ? 10 : 12, fontWeight: "700", letterSpacing: 0.3, color: c.color }}
      >
        {c.label}
      </Text>
    </View>
  );
}
