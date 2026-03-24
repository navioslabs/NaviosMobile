import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { User, MapPin, Camera, ImageIcon, Send } from "@/lib/icons";
import { makeTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

/** つぶやき投稿画面 */
export default function TalkPostScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = makeTokens(isDark);
  const [msg, setMsg] = useState("");

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.bg }]} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Avatar + input */}
      <View style={styles.inputRow}>
        <LinearGradient colors={[t.accent, t.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
          <User size={20} color="#fff" />
        </LinearGradient>
        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="この場所で何が起きてる？"
          placeholderTextColor={t.sub}
          multiline
          autoFocus
          style={[styles.textArea, { color: t.text }]}
        />
      </View>

      {/* Location tag */}
      <View style={[styles.locTag, { backgroundColor: t.surface, borderColor: t.border }]}>
        <MapPin size={15} color={t.accent} />
        <Text style={[styles.locText, { color: t.accent }]}>📍 越谷市・現在地周辺</Text>
        <Text style={[styles.locAuto, { color: t.muted }]}>自動検出</Text>
      </View>

      {/* Photo options */}
      <View style={styles.photoRow}>
        {[{ Icon: Camera, l: "撮影" }, { Icon: ImageIcon, l: "選択" }].map(({ Icon, l }) => (
          <Pressable key={l} style={[styles.photoBtn, { borderColor: t.border, backgroundColor: t.surface }]}>
            <Icon size={18} color={t.sub} />
            <Text style={[styles.photoBtnText, { color: t.sub }]}>{l}</Text>
          </Pressable>
        ))}
      </View>

      {/* Character count + submit */}
      <View style={styles.submitRow}>
        <Text style={[styles.charCount, { color: msg.length > 140 ? t.red : t.muted }]}>
          {msg.length}/140
        </Text>
        <Pressable onPress={() => { if (msg.length > 0) router.back(); }}>
          <LinearGradient
            colors={msg.length > 0 ? [t.accent, t.blue] : [t.surface2, t.surface2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitBtn}
          >
            <Send size={14} color={msg.length > 0 ? "#000" : t.muted} />
            <Text style={[styles.submitText, { color: msg.length > 0 ? "#000" : t.muted }]}>つぶやく</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 16 },
  inputRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  textArea: { flex: 1, fontSize: 16, minHeight: 120, lineHeight: 24, textAlignVertical: "top" },
  locTag: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderWidth: 1, borderRadius: 12 },
  locText: { fontSize: 12, fontWeight: "600" },
  locAuto: { marginLeft: "auto", fontSize: 10 },
  photoRow: { flexDirection: "row", gap: 8 },
  photoBtn: { width: 60, height: 60, borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 4 },
  photoBtnText: { fontSize: 9 },
  submitRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  charCount: { fontSize: 11 },
  submitBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 11 },
  submitText: { fontWeight: "800", fontSize: 14 },
});
