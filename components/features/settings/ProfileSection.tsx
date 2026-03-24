import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { User, ChevronRight } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";

interface ProfileSectionProps {
  t: ThemeTokens;
}

/** プロフィールセクション */
export default function ProfileSection({ t }: ProfileSectionProps) {
  return (
    <View className="p-5" style={{ backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.border }}>
      <View className="flex-row items-center gap-3.5">
        <LinearGradient colors={[t.accent, t.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="w-14 h-14 rounded-full items-center justify-center">
          <User size={24} color="#fff" />
        </LinearGradient>
        <View className="flex-1">
          <Text className="text-[17px] font-bold" style={{ color: t.text }}>ゲストユーザー</Text>
          <Text className="text-xs mt-0.5" style={{ color: t.sub }}>プロフィールを設定</Text>
        </View>
        <ChevronRight size={18} color={t.muted} />
      </View>
    </View>
  );
}
