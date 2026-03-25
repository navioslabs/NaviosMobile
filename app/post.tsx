import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, ImageIcon, MapPin, Locate } from "@/lib/icons";
import { CAT_CONFIG, type CategoryId } from "@/constants/categories";
import { useCreatePost } from "@/hooks/usePosts";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";

/** カテゴリ別の説明文 */
const CAT_HINTS: Record<CategoryId, string> = {
  stock: "食料品、日用品など物資の共有に",
  event: "地域のイベント・集まりの告知に",
  help: "困りごとの相談・助け合いに",
  admin: "行政からのお知らせ・手続き情報に",
};

/** 新規投稿画面 */
export default function PostScreen() {
  const { s, t, fs } = useAppStyles();
  const createPostMutation = useCreatePost();

  const [cat, setCat] = useState<CategoryId>("stock");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const canSubmit = title.trim().length > 0 && !createPostMutation.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await createPostMutation.mutateAsync({
        category: cat,
        title: title.trim(),
        content: content.trim() || undefined,
      });
      Alert.alert("投稿完了", "投稿が作成されました", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("エラー", e.message ?? "投稿に失敗しました");
    }
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: SPACE.xl, paddingBottom: 40, gap: SPACE.lg }} showsVerticalScrollIndicator={false}>
      {/* カテゴリ */}
      <View>
        <Text style={[s.textSectionLabel, { marginBottom: SPACE.sm }]}>カテゴリ <Text style={{ color: t.red }}>*</Text></Text>
        <View style={{ flexDirection: "row", gap: SPACE.sm }}>
          {(Object.entries(CAT_CONFIG) as [CategoryId, typeof CAT_CONFIG[CategoryId]][]).map(([id, c]) => {
            const Icon = c.icon;
            const active = cat === id;
            return (
              <Pressable key={id} onPress={() => setCat(id)} style={({ pressed }) => ({ flex: 1, alignItems: "center" as const, gap: 6, borderRadius: RADIUS.lg, paddingVertical: SPACE.md, paddingHorizontal: 6, borderWidth: active ? 2 : 1, borderColor: active ? c.color : t.border, backgroundColor: active ? c.color + "18" : t.surface, opacity: pressed ? 0.7 : 1 })}>
                <Icon size={20} color={active ? c.color : t.sub} />
                <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: active ? c.color : t.sub }}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={{ fontSize: fs.xxs, color: t.muted, marginTop: SPACE.sm }}>{CAT_HINTS[cat]}</Text>
      </View>

      {/* タイトル */}
      <View>
        <Text style={[s.textSectionLabel, { marginBottom: SPACE.sm }]}>タイトル <Text style={{ color: t.red }}>*</Text></Text>
        <TextInput style={s.input} placeholder="タイトルを入力" placeholderTextColor={t.sub} value={title} onChangeText={setTitle} />
      </View>

      {/* 詳細 */}
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.sm }}>
          <Text style={s.textSectionLabel}>詳細</Text>
          <Text style={{ fontSize: fs.xxs, color: t.muted }}>任意</Text>
        </View>
        <TextInput style={[s.input, { height: 100, textAlignVertical: "top" }]} placeholder="詳細を入力" placeholderTextColor={t.sub} value={content} onChangeText={setContent} multiline />
      </View>

      {/* 写真 */}
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.sm }}>
          <Text style={s.textSectionLabel}>写真</Text>
          <Text style={{ fontSize: fs.xxs, color: t.muted }}>任意</Text>
        </View>
        <View style={{ flexDirection: "row", gap: SPACE.sm }}>
          {[{ Icon: Camera, l: "撮影" }, { Icon: ImageIcon, l: "選択" }].map(({ Icon, l }) => (
            <Pressable key={l} style={({ pressed }) => ({ width: 72, height: 72, borderRadius: RADIUS.lg, alignItems: "center" as const, justifyContent: "center" as const, gap: 5, borderWidth: 1.5, borderStyle: "dashed" as const, borderColor: t.border, backgroundColor: t.surface, opacity: pressed ? 0.7 : 1 })}>
              <Icon size={22} color={t.sub} />
              <Text style={{ fontSize: fs.xs, color: t.sub }}>{l}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 場所 */}
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.sm }}>
          <Text style={s.textSectionLabel}>場所</Text>
          <Text style={{ fontSize: fs.xxs, color: t.muted }}>任意</Text>
        </View>
        <Pressable style={({ pressed }) => [s.card, { flexDirection: "row" as const, alignItems: "center" as const, gap: SPACE.sm + 2, opacity: pressed ? 0.7 : 1 }]}>
          <MapPin size={18} color={t.sub} />
          <Text style={{ flex: 1, fontSize: fs.base, color: t.sub }}>場所を設定</Text>
          <Locate size={16} color={t.sub} />
        </Pressable>
      </View>

      {/* 投稿ボタン */}
      <Pressable
        onPress={handleSubmit}
        style={({ pressed }) => ({ opacity: pressed && canSubmit ? 0.8 : 1 })}
        disabled={!canSubmit}
      >
        <LinearGradient
          colors={canSubmit ? [t.accent, t.blue] : [t.surface2, t.surface2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: RADIUS.lg, padding: SPACE.lg, alignItems: "center" }}
        >
          <Text style={{ color: canSubmit ? "#000" : t.muted, fontWeight: WEIGHT.extrabold, fontSize: fs.lg + 1 }}>投稿する</Text>
        </LinearGradient>
      </Pressable>
      {!canSubmit && (
        <Text style={{ fontSize: fs.sm, color: t.muted, textAlign: "center", marginTop: SPACE.xs }}>
          タイトルを入力すると投稿できます
        </Text>
      )}
    </ScrollView>
  );
}
