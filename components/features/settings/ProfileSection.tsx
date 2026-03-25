import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { User, ChevronRight } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { Profile } from "@/types";
import { WEIGHT, SPACE, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface ProfileSectionProps {
  t: ThemeTokens;
  isGuest: boolean;
  profile: Profile | null;
}

/** プロフィールセクション */
export default function ProfileSection({ t, isGuest, profile }: ProfileSectionProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);

  const handlePress = () => {
    if (isGuest) {
      router.push("/(auth)/login");
    } else {
      router.push("/profile/edit");
    }
  };

  return (
    <Pressable
      onPress={handlePress}
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
          <Text style={{ fontSize: fs.xl + 1, fontWeight: WEIGHT.bold, color: t.text }}>
            {isGuest ? "ゲストユーザー" : (profile?.display_name ?? "ユーザー")}
          </Text>
          <Text style={{ fontSize: fs.md, marginTop: 2, color: t.sub }}>
            {isGuest ? "ログインして始めよう" : "プロフィールを編集"}
          </Text>
        </View>
        <ChevronRight size={18} color={t.muted} />
      </View>
    </Pressable>
  );
}
