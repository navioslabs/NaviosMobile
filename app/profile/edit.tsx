import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Camera,
  User,
  MapPin,
  Check,
} from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { useAppStyles } from "@/hooks/useAppStyles";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import { getScaledFontSize, WEIGHT, SPACE, RADIUS } from "@/lib/styles";

/** プロフィール編集画面 */
export default function ProfileEditScreen() {
  const { s, t, fs } = useAppStyles();

  const [name, setName] = useState("ゲストユーザー");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("越谷市");

  const isValid = name.trim().length > 0;

  return (
    <View style={s.screen}>
      {/* ヘッダー */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACE.lg, paddingTop: 52, paddingBottom: SPACE.md, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.border }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}
        >
          <ChevronLeft size={24} color={t.text} />
        </Pressable>
        <Text style={s.textHeading}>プロフィール編集</Text>
        <Pressable
          onPress={() => { if (isValid) router.back(); }}
          disabled={!isValid}
          style={({ pressed }) => ({
            paddingHorizontal: SPACE.lg,
            paddingVertical: SPACE.sm,
            borderRadius: RADIUS.full,
            backgroundColor: isValid ? t.accent : t.surface2,
            opacity: pressed && isValid ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: isValid ? "#000" : t.muted }}>保存</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* アバター編集 */}
        <View style={{ alignItems: "center", paddingVertical: SPACE.xxl }}>
          <View style={{ position: "relative" }}>
            <LinearGradient
              colors={[t.accent, t.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" }}
            >
              <User size={40} color="#fff" />
            </LinearGradient>
            <Pressable
              style={({ pressed }) => ({
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: t.accent,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: t.bg,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Camera size={14} color="#000" />
            </Pressable>
          </View>
          <Text style={{ fontSize: fs.sm, color: t.accent, fontWeight: WEIGHT.semibold, marginTop: SPACE.md }}>写真を変更</Text>
        </View>

        {/* フォーム */}
        <View style={{ paddingHorizontal: SPACE.xl, gap: SPACE.xl }}>
          {/* 表示名 */}
          <View>
            <Text style={[s.textSectionLabel, { marginBottom: SPACE.sm }]}>表示名</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="表示名を入力"
              placeholderTextColor={t.muted}
              style={[s.input, { fontSize: fs.lg }]}
              maxLength={20}
            />
            <Text style={{ fontSize: fs.xs, color: t.muted, marginTop: SPACE.xs, textAlign: "right" }}>
              {name.length}/20
            </Text>
          </View>

          {/* 自己紹介 */}
          <View>
            <Text style={[s.textSectionLabel, { marginBottom: SPACE.sm }]}>自己紹介</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="自己紹介を入力（任意）"
              placeholderTextColor={t.muted}
              style={[s.input, { height: 100, textAlignVertical: "top" }]}
              multiline
              maxLength={150}
            />
            <Text style={{ fontSize: fs.xs, color: bio.length > 140 ? t.red : t.muted, marginTop: SPACE.xs, textAlign: "right" }}>
              {bio.length}/150
            </Text>
          </View>

          {/* 地域 */}
          <View>
            <Text style={[s.textSectionLabel, { marginBottom: SPACE.sm }]}>地域</Text>
            <View style={[s.card, { flexDirection: "row", alignItems: "center", gap: SPACE.sm + 2 }]}>
              <MapPin size={18} color={t.accent} />
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="地域を入力"
                placeholderTextColor={t.muted}
                style={{ flex: 1, fontSize: fs.lg, color: t.text }}
              />
            </View>
          </View>

          {/* 公開設定 */}
          <View>
            <Text style={[s.textSectionLabel, { marginBottom: SPACE.sm }]}>公開設定</Text>
            <View style={{ gap: SPACE.sm }}>
              {[
                { label: "プロフィールを公開", desc: "他のユーザーからプロフィールが見えます", enabled: true },
                { label: "位置情報を表示", desc: "投稿に位置情報を表示します", enabled: true },
                { label: "チェックイン履歴を公開", desc: "訪問履歴を他のユーザーに公開します", enabled: false },
              ].map((item) => (
                <PrivacyToggle key={item.label} item={item} t={t} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/** プライバシー設定トグル行 */
function PrivacyToggle({ item, t }: { item: { label: string; desc: string; enabled: boolean }; t: ThemeTokens }) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const [enabled, setEnabled] = useState(item.enabled);

  return (
    <Pressable
      onPress={() => setEnabled(!enabled)}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: SPACE.md,
        padding: SPACE.md,
        borderRadius: RADIUS.md,
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.border,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: t.text }}>{item.label}</Text>
        <Text style={{ fontSize: fs.xs, color: t.muted, marginTop: 2 }}>{item.desc}</Text>
      </View>
      <View style={{ width: 48, height: 28, borderRadius: 14, justifyContent: "center", backgroundColor: enabled ? t.accent : t.surface3 }}>
        <View style={{ position: "absolute", top: 2, width: 24, height: 24, borderRadius: 12, backgroundColor: enabled ? "#000" : "#fff", transform: [{ translateX: enabled ? 22 : 2 }], alignItems: "center", justifyContent: "center" }}>
          {enabled && <Check size={12} color={t.accent} />}
        </View>
      </View>
    </Pressable>
  );
}
