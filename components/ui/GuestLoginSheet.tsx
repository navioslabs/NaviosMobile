import { View, Text, Pressable, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { User } from "@/lib/icons";
import { useGuestSheetStore } from "@/stores/guestSheetStore";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";

/** ゲストユーザー向けログイン誘導ボトムシート */
export default function GuestLoginSheet() {
  const { visible, featureName, hide } = useGuestSheetStore();
  const { t, fs } = useAppStyles();

  const handleLogin = () => {
    hide();
    setTimeout(() => router.push("/(auth)/login"), 200);
  };

  const handleSignup = () => {
    hide();
    setTimeout(() => router.push("/(auth)/signup"), 200);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={hide}>
      <View
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
      >
        <Pressable style={{ flex: 1 }} onPress={hide} />

        <View
          style={{
            backgroundColor: t.surface,
            borderTopLeftRadius: RADIUS.xxl + 4,
            borderTopRightRadius: RADIUS.xxl + 4,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: t.border,
            padding: SPACE.xl,
            paddingBottom: SPACE.xxxl + 8,
          }}
        >
          {/* ハンドルバー */}
          <View style={{ alignItems: "center", marginBottom: SPACE.xl }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: t.muted + "40" }} />
          </View>

          {/* アイコン */}
          <View style={{ alignItems: "center", marginBottom: SPACE.lg }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: t.accent + "18", alignItems: "center", justifyContent: "center" }}>
              <User size={28} color={t.accent} />
            </View>
          </View>

          {/* テキスト */}
          <Text style={{ fontSize: fs.xl, fontWeight: WEIGHT.extrabold, color: t.text, textAlign: "center", marginBottom: SPACE.sm }}>
            ログインが必要です
          </Text>
          <Text style={{ fontSize: fs.base, color: t.sub, textAlign: "center", lineHeight: 22, marginBottom: SPACE.xl }}>
            {featureName
              ? `「${featureName}」するにはログインしてください`
              : "この機能を使うにはログインしてください"}
          </Text>

          {/* ボタン */}
          <Pressable
            onPress={handleLogin}
            accessibilityLabel="ログイン"
            accessibilityRole="button"
            style={({ pressed }) => ({ marginBottom: SPACE.md, opacity: pressed ? 0.85 : 1 })}
          >
            <LinearGradient
              colors={[t.accent, t.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingVertical: SPACE.md + 2, borderRadius: RADIUS.lg, alignItems: "center" }}
            >
              <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: "#000" }}>ログイン</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={handleSignup}
            accessibilityLabel="新規登録"
            accessibilityRole="button"
            style={({ pressed }) => ({
              paddingVertical: SPACE.md + 2,
              borderRadius: RADIUS.lg,
              alignItems: "center",
              backgroundColor: t.surface2,
              borderWidth: 1,
              borderColor: t.border,
              marginBottom: SPACE.md,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: t.text }}>新規登録</Text>
          </Pressable>

          <Pressable onPress={hide}>
            <Text style={{ fontSize: fs.sm, color: t.muted, textAlign: "center" }}>あとで</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
