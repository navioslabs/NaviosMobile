import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { User, ChevronRight } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { FONT_SIZE, WEIGHT, SPACE } from "@/lib/styles";

interface ProfileSectionProps {
  t: ThemeTokens;
}

/** プロフィールセクション */
export default function ProfileSection({ t }: ProfileSectionProps) {
  return (
    <Pressable
      onPress={() => router.push("/profile/edit")}
      style={({ pressed }) => ({
        padding: SPACE.xl,
        backgroundColor: t.surface,
        borderBottomWidth: 1,
        borderBottomColor: t.border,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.lg }}>
        <LinearGradient
          colors={[t.accent, t.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" }}
        >
          <User size={24} color="#fff" />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: FONT_SIZE.xl + 1, fontWeight: WEIGHT.bold, color: t.text }}>ゲストユーザー</Text>
          <Text style={{ fontSize: FONT_SIZE.md, marginTop: 2, color: t.sub }}>プロフィールを設定</Text>
        </View>
        <ChevronRight size={18} color={t.muted} />
      </View>
    </Pressable>
  );
}
