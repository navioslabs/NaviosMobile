import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, ImageIcon, MapPin, Locate } from "@/lib/icons";
import { makeTokens } from "@/constants/theme";
import { CAT_CONFIG, type CategoryId } from "@/constants/categories";
import { useThemeStore } from "@/stores/themeStore";
import { createStyles, FONT_SIZE, WEIGHT, SPACE, RADIUS } from "@/lib/styles";

/** 新規投稿画面 */
export default function PostScreen() {
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);
  const s = createStyles(t);

  const [cat, setCat] = useState<CategoryId>("stock");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: SPACE.xl, paddingBottom: 40, gap: SPACE.lg }} showsVerticalScrollIndicator={false}>
      <View>
        <Text style={[s.textSectionLabel, { marginBottom: SPACE.sm }]}>カテゴリ</Text>
        <View style={{ flexDirection: "row", gap: SPACE.sm }}>
          {(Object.entries(CAT_CONFIG) as [CategoryId, typeof CAT_CONFIG[CategoryId]][]).map(([id, c]) => {
            const Icon = c.icon;
            const active = cat === id;
            return (
              <Pressable key={id} onPress={() => setCat(id)} style={({ pressed }) => ({ flex: 1, alignItems: "center" as const, gap: 6, borderRadius: RADIUS.lg, paddingVertical: SPACE.md, paddingHorizontal: 6, borderWidth: 1, borderColor: active ? c.color : t.border, backgroundColor: active ? c.color + "18" : t.surface, opacity: pressed ? 0.7 : 1 })}>
                <Icon size={20} color={active ? c.color : t.sub} />
                <Text style={{ fontSize: FONT_SIZE.xs, fontWeight: WEIGHT.semibold, color: active ? c.color : t.sub }}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <Text style={[s.textSectionLabel, { marginBottom: SPACE.sm }]}>タイトル</Text>
        <TextInput style={s.input} placeholder="タイトルを入力" placeholderTextColor={t.sub} value={title} onChangeText={setTitle} />
      </View>

      <View>
        <Text style={[s.textSectionLabel, { marginBottom: SPACE.sm }]}>詳細</Text>
        <TextInput style={[s.input, { height: 100, textAlignVertical: "top" }]} placeholder="詳細を入力" placeholderTextColor={t.sub} value={content} onChangeText={setContent} multiline />
      </View>

      <View>
        <Text style={[s.textSectionLabel, { marginBottom: SPACE.sm }]}>写真</Text>
        <View style={{ flexDirection: "row", gap: SPACE.sm }}>
          {[{ Icon: Camera, l: "撮影" }, { Icon: ImageIcon, l: "選択" }].map(({ Icon, l }) => (
            <Pressable key={l} style={{ width: 72, height: 72, borderRadius: RADIUS.lg, alignItems: "center", justifyContent: "center", gap: 5, borderWidth: 1.5, borderStyle: "dashed", borderColor: t.border, backgroundColor: t.surface }}>
              <Icon size={22} color={t.sub} />
              <Text style={{ fontSize: FONT_SIZE.xs, color: t.sub }}>{l}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable style={[s.card, { flexDirection: "row", alignItems: "center", gap: SPACE.sm + 2 }]}>
        <MapPin size={18} color={t.sub} />
        <Text style={{ flex: 1, fontSize: FONT_SIZE.base, color: t.sub }}>場所を設定</Text>
        <Locate size={16} color={t.sub} />
      </Pressable>

      <Pressable
        onPress={() => { if (title.trim().length > 0) router.back(); }}
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        disabled={title.trim().length === 0}
      >
        <LinearGradient
          colors={title.trim().length > 0 ? [t.accent, t.blue] : [t.surface2, t.surface2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: RADIUS.lg, padding: SPACE.lg, alignItems: "center" }}
        >
          <Text style={{ color: title.trim().length > 0 ? "#000" : t.muted, fontWeight: WEIGHT.extrabold, fontSize: FONT_SIZE.lg + 1 }}>投稿する</Text>
        </LinearGradient>
      </Pressable>
      {title.trim().length === 0 && (
        <Text style={{ fontSize: FONT_SIZE.sm, color: t.muted, textAlign: "center", marginTop: SPACE.xs }}>
          タイトルを入力すると投稿できます
        </Text>
      )}
    </ScrollView>
  );
}
