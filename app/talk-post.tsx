import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
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
    <ScrollView className="flex-1" style={{ backgroundColor: t.bg }} contentContainerClassName="p-5 pb-10 gap-4" showsVerticalScrollIndicator={false}>
      {/* Avatar + input */}
      <View className="flex-row gap-3 items-start">
        <LinearGradient colors={[t.accent, t.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="w-[42px] h-[42px] rounded-full items-center justify-center">
          <User size={20} color="#fff" />
        </LinearGradient>
        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="この場所で何が起きてる？"
          placeholderTextColor={t.sub}
          multiline
          autoFocus
          className="flex-1 text-base min-h-[120px] leading-6"
          style={{ color: t.text, textAlignVertical: "top" }}
        />
      </View>

      {/* Location tag */}
      <View className="flex-row items-center gap-2 p-2.5 rounded-xl" style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }}>
        <MapPin size={15} color={t.accent} />
        <Text className="text-xs font-semibold" style={{ color: t.accent }}>📍 越谷市・現在地周辺</Text>
        <Text className="ml-auto text-[10px]" style={{ color: t.muted }}>自動検出</Text>
      </View>

      {/* Photo options */}
      <View className="flex-row gap-2">
        {[{ Icon: Camera, l: "撮影" }, { Icon: ImageIcon, l: "選択" }].map(({ Icon, l }) => (
          <Pressable key={l} className="w-[60px] h-[60px] rounded-[14px] items-center justify-center gap-1" style={{ borderWidth: 1.5, borderStyle: "dashed", borderColor: t.border, backgroundColor: t.surface }}>
            <Icon size={18} color={t.sub} />
            <Text className="text-[9px]" style={{ color: t.sub }}>{l}</Text>
          </Pressable>
        ))}
      </View>

      {/* Character count + submit */}
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px]" style={{ color: msg.length > 140 ? t.red : t.muted }}>
          {msg.length}/140
        </Text>
        <Pressable onPress={() => { if (msg.length > 0) router.back(); }}>
          <LinearGradient
            colors={msg.length > 0 ? [t.accent, t.blue] : [t.surface2, t.surface2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-row items-center gap-1.5 rounded-[14px] px-7 py-[11px]"
          >
            <Send size={14} color={msg.length > 0 ? "#000" : t.muted} />
            <Text className="font-extrabold text-sm" style={{ color: msg.length > 0 ? "#000" : t.muted }}>つぶやく</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </ScrollView>
  );
}
