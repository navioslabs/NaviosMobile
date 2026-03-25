import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { User, MapPin, Camera, ImageIcon, Send } from "@/lib/icons";
import { makeTokens } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";
import { createStyles, FONT_SIZE, WEIGHT, SPACE, RADIUS } from "@/lib/styles";

/** つぶやき投稿画面 */
export default function TalkPostScreen() {
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);
  const s = createStyles(t);
  const [msg, setMsg] = useState("");

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: SPACE.xl, paddingBottom: 40, gap: SPACE.lg }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: "row", gap: SPACE.md, alignItems: "flex-start" }}>
        <LinearGradient colors={[t.accent, t.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" }}>
          <User size={22} color="#fff" />
        </LinearGradient>
        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="この場所で何が起きてる？"
          placeholderTextColor={t.sub}
          multiline
          autoFocus
          style={{ flex: 1, fontSize: FONT_SIZE.xl, minHeight: 120, lineHeight: 26, color: t.text, textAlignVertical: "top" }}
        />
      </View>

      <View style={[s.card, { flexDirection: "row", alignItems: "center", gap: SPACE.sm }]}>
        <MapPin size={16} color={t.accent} />
        <Text style={{ fontSize: FONT_SIZE.md, fontWeight: WEIGHT.semibold, color: t.accent }}>📍 越谷市・現在地周辺</Text>
        <Text style={{ marginLeft: "auto", fontSize: FONT_SIZE.xs, color: t.muted }}>自動検出</Text>
      </View>

      <View style={{ flexDirection: "row", gap: SPACE.sm }}>
        {[{ Icon: Camera, l: "撮影" }, { Icon: ImageIcon, l: "選択" }].map(({ Icon, l }) => (
          <Pressable key={l} style={{ width: 60, height: 60, borderRadius: RADIUS.lg, alignItems: "center", justifyContent: "center", gap: SPACE.xs, borderWidth: 1.5, borderStyle: "dashed", borderColor: t.border, backgroundColor: t.surface }}>
            <Icon size={20} color={t.sub} />
            <Text style={{ fontSize: FONT_SIZE.xxs, color: t.sub }}>{l}</Text>
          </Pressable>
        ))}
      </View>

      <View style={s.rowBetween}>
        <Text style={{ fontSize: FONT_SIZE.sm, color: msg.length > 140 ? t.red : t.muted }}>
          {msg.length}/140
        </Text>
        <Pressable onPress={() => { if (msg.length > 0) router.back(); }}>
          <LinearGradient
            colors={msg.length > 0 ? [t.accent, t.blue] : [t.surface2, t.surface2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, borderRadius: RADIUS.lg, paddingHorizontal: SPACE.xxl + 4, paddingVertical: SPACE.md }}
          >
            <Send size={15} color={msg.length > 0 ? "#000" : t.muted} />
            <Text style={{ fontWeight: WEIGHT.extrabold, fontSize: FONT_SIZE.lg, color: msg.length > 0 ? "#000" : t.muted }}>つぶやく</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </ScrollView>
  );
}
