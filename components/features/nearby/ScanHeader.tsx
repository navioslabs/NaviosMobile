import { View, Text } from "react-native";
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
    <View
      className="py-4 px-5"
      style={{ backgroundColor: isDark ? "rgba(0,212,161,0.05)" : "rgba(0,212,161,0.07)", borderBottomWidth: 1, borderBottomColor: t.border }}
    >
      <View className="flex-row items-center gap-2.5">
        <View className="w-[42px] h-[42px] rounded-[14px] items-center justify-center" style={{ backgroundColor: t.accent + "18" }}>
          <Radio size={20} color={t.accent} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold" style={{ color: t.text }}>周辺をスキャン中</Text>
          <Text className="text-[11px] mt-0.5" style={{ color: t.sub }}>{postCount}件のイベントを検出 • 越谷市周辺</Text>
        </View>
        <View className="flex-row items-center gap-[3px] rounded-[10px] px-2.5 py-[5px] bg-accent">
          <Eye size={12} color="#000" />
          <Text className="text-[11px] font-extrabold text-black">LIVE</Text>
        </View>
      </View>
    </View>
  );
}
