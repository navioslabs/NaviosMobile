import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, ImageIcon, MapPin, Locate } from "@/lib/icons";
import { makeTokens } from "@/constants/theme";
import { CAT_CONFIG, type CategoryId } from "@/constants/categories";
import { useColorScheme } from "@/hooks/use-color-scheme";

/** 新規投稿画面 */
export default function PostScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = makeTokens(isDark);

  const [cat, setCat] = useState<CategoryId>("stock");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.bg }]} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Category */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: t.sub }]}>カテゴリ</Text>
        <View style={styles.catGrid}>
          {(Object.entries(CAT_CONFIG) as [CategoryId, typeof CAT_CONFIG[CategoryId]][]).map(([id, c]) => {
            const Icon = c.icon;
            const active = cat === id;
            return (
              <Pressable key={id} onPress={() => setCat(id)} style={[styles.catBtn, { borderColor: active ? c.color : t.border, backgroundColor: active ? c.color + "18" : t.surface }]}>
                <Icon size={18} color={active ? c.color : t.sub} />
                <Text style={[styles.catLabel, { color: active ? c.color : t.sub }]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Title */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: t.sub }]}>タイトル</Text>
        <TextInput style={[styles.input, { backgroundColor: t.surface, borderColor: t.border, color: t.text }]} placeholder="タイトルを入力" placeholderTextColor={t.sub} value={title} onChangeText={setTitle} />
      </View>

      {/* Detail */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: t.sub }]}>詳細</Text>
        <TextInput style={[styles.input, styles.textarea, { backgroundColor: t.surface, borderColor: t.border, color: t.text }]} placeholder="詳細を入力" placeholderTextColor={t.sub} value={content} onChangeText={setContent} multiline />
      </View>

      {/* Photo */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: t.sub }]}>写真</Text>
        <View style={styles.photoRow}>
          {[{ Icon: Camera, l: "撮影" }, { Icon: ImageIcon, l: "選択" }].map(({ Icon, l }) => (
            <Pressable key={l} style={[styles.photoBtn, { borderColor: t.border, backgroundColor: t.surface }]}>
              <Icon size={20} color={t.sub} />
              <Text style={[styles.photoBtnText, { color: t.sub }]}>{l}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Location */}
      <Pressable style={[styles.locBtn, { backgroundColor: t.surface, borderColor: t.border }]}>
        <MapPin size={17} color={t.sub} />
        <Text style={[styles.locText, { color: t.sub }]}>場所を設定</Text>
        <Locate size={15} color={t.sub} />
      </Pressable>

      {/* Submit */}
      <Pressable onPress={() => router.back()}>
        <LinearGradient colors={[t.accent, t.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitBtn}>
          <Text style={styles.submitText}>投稿する</Text>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 16 },
  section: {},
  label: { fontSize: 11, fontWeight: "700", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" },
  catGrid: { flexDirection: "row", gap: 8 },
  catBtn: { flex: 1, paddingVertical: 12, paddingHorizontal: 6, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 6 },
  catLabel: { fontSize: 10, fontWeight: "600" },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14 },
  textarea: { height: 88, textAlignVertical: "top" },
  photoRow: { flexDirection: "row", gap: 8 },
  photoBtn: { width: 72, height: 72, borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 5 },
  photoBtnText: { fontSize: 10 },
  locBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderWidth: 1, borderRadius: 12 },
  locText: { flex: 1, fontSize: 13 },
  submitBtn: { borderRadius: 14, padding: 15, alignItems: "center" },
  submitText: { color: "#000", fontWeight: "800", fontSize: 15 },
});
