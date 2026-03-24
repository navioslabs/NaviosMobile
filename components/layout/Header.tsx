import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Navigation, Bell, User } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";

interface HeaderProps {
  t: ThemeTokens;
}

/** アプリ共通ヘッダー（Naviosロゴ + アクションボタン） */
export default function Header({ t }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between px-5 pb-3"
      style={{ paddingTop: insets.top + 8, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.border }}
    >
      {/* Logo */}
      <View className="flex-row items-center gap-2">
        <LinearGradient
          colors={[t.accent, t.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-[30px] h-[30px] rounded-[9px] items-center justify-center"
        >
          <Navigation size={14} color="#000" />
        </LinearGradient>
        <Text className="text-[19px] font-extrabold tracking-tight text-accent">
          Navios
        </Text>
      </View>

      {/* Action buttons */}
      <View className="flex-row items-center gap-2">
        <Pressable
          className="w-[34px] h-[34px] rounded-full items-center justify-center"
          style={{ backgroundColor: t.surface2, borderWidth: 1, borderColor: t.border }}
        >
          <Bell size={15} color={t.sub} />
        </Pressable>
        <Pressable
          className="w-[34px] h-[34px] rounded-full items-center justify-center"
          style={{ backgroundColor: t.surface2, borderWidth: 1, borderColor: t.border }}
        >
          <User size={15} color={t.sub} />
        </Pressable>
      </View>
    </View>
  );
}
