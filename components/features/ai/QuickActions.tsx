import { View, Text, Pressable } from "react-native";
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
    <View className="mb-[22px]">
      <Text className="text-[11px] font-bold mb-2 tracking-wider uppercase" style={{ color: t.sub }}>
        クイックアクション
      </Text>
      <View className="flex-row flex-wrap gap-2.5">
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <Pressable
              key={i}
              className="w-[48%] rounded-2xl p-3.5 gap-2"
              style={{ backgroundColor: a.bg, borderWidth: 1, borderColor: a.dc + "22" }}
            >
              <View className="w-[34px] h-[34px] rounded-[10px] items-center justify-center" style={{ backgroundColor: a.dc + "20" }}>
                <Icon size={17} color={a.dc} />
              </View>
              <Text className="text-xs font-semibold leading-4" style={{ color: t.text }}>{a.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
