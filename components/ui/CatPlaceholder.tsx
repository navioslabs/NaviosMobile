import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CAT_CONFIG, type CategoryId } from "@/constants/categories";
import { WEIGHT } from "@/lib/styles";

/** カテゴリ別のグラデーション定義 */
const CAT_GRADIENT_COLORS: Record<CategoryId, [string, string]> = {
  lifeline: ["#00D4A1", "#00896B"],
  event: ["#F5A623", "#C47D0A"],
  help: ["#F0425C", "#B8223A"],
};

interface CatPlaceholderProps {
  category: string;
  /** 表示サイズ: "sm"=68x68サムネ, "md"=16:9カード, "lg"=3:4カード */
  size?: "sm" | "md" | "lg";
}

/** 画像なし投稿のカテゴリ別プレースホルダー */
export default function CatPlaceholder({ category, size = "md" }: CatPlaceholderProps) {
  const cat = CAT_CONFIG[category as CategoryId];
  const Icon = cat?.icon;
  const colors = CAT_GRADIENT_COLORS[category as CategoryId] ?? ["#8887A0", "#5E5D78"];
  const label = cat?.label ?? "";

  if (size === "sm") {
    return (
      <LinearGradient
        colors={[colors[0] + "30", colors[1] + "50"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: 68, height: 68, alignItems: "center", justifyContent: "center", gap: 4 }}
      >
        {Icon && <Icon size={24} color={colors[0]} />}
        <Text style={{ fontSize: 9, fontWeight: WEIGHT.bold, color: colors[0] }}>{label}</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors[0] + "20", colors[1] + "40"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", gap: 6 }}
    >
      {Icon && <Icon size={size === "lg" ? 48 : 40} color={colors[0] + "80"} />}
      <Text style={{ fontSize: size === "lg" ? 14 : 12, fontWeight: WEIGHT.bold, color: colors[0] + "90" }}>
        {label}
      </Text>
    </LinearGradient>
  );
}
