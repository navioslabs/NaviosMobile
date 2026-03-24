import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, ImageIcon, MapPin, Locate } from "@/lib/icons";
import { makeTokens } from "@/constants/theme";
import { CAT_CONFIG, type CategoryId } from "@/constants/categories";
import { useThemeStore } from "@/stores/themeStore";

/** 新規投稿画面 */
export default function PostScreen() {
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);

  const [cat, setCat] = useState<CategoryId>("stock");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: t.bg }} contentContainerClassName="p-5 pb-10 gap-4" showsVerticalScrollIndicator={false}>
      {/* Category */}
      <View>
        <Text className="text-[11px] font-bold mb-2 tracking-wider uppercase" style={{ color: t.sub }}>カテゴリ</Text>
        <View className="flex-row gap-2">
          {(Object.entries(CAT_CONFIG) as [CategoryId, typeof CAT_CONFIG[CategoryId]][]).map(([id, c]) => {
            const Icon = c.icon;
            const active = cat === id;
            return (
              <Pressable
                key={id}
                onPress={() => setCat(id)}
                className="flex-1 items-center gap-1.5 rounded-[14px] py-3 px-1.5"
                style={{ borderWidth: 1, borderColor: active ? c.color : t.border, backgroundColor: active ? c.color + "18" : t.surface }}
              >
                <Icon size={18} color={active ? c.color : t.sub} />
                <Text className="text-[10px] font-semibold" style={{ color: active ? c.color : t.sub }}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Title */}
      <View>
        <Text className="text-[11px] font-bold mb-2 tracking-wider uppercase" style={{ color: t.sub }}>タイトル</Text>
        <TextInput
          className="rounded-xl p-3 text-sm"
          style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, color: t.text }}
          placeholder="タイトルを入力"
          placeholderTextColor={t.sub}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Detail */}
      <View>
        <Text className="text-[11px] font-bold mb-2 tracking-wider uppercase" style={{ color: t.sub }}>詳細</Text>
        <TextInput
          className="rounded-xl p-3 text-sm h-[88px]"
          style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, color: t.text, textAlignVertical: "top" }}
          placeholder="詳細を入力"
          placeholderTextColor={t.sub}
          value={content}
          onChangeText={setContent}
          multiline
        />
      </View>

      {/* Photo */}
      <View>
        <Text className="text-[11px] font-bold mb-2 tracking-wider uppercase" style={{ color: t.sub }}>写真</Text>
        <View className="flex-row gap-2">
          {[{ Icon: Camera, l: "撮影" }, { Icon: ImageIcon, l: "選択" }].map(({ Icon, l }) => (
            <Pressable key={l} className="w-[72px] h-[72px] rounded-[14px] items-center justify-center gap-[5px]" style={{ borderWidth: 1.5, borderStyle: "dashed", borderColor: t.border, backgroundColor: t.surface }}>
              <Icon size={20} color={t.sub} />
              <Text className="text-[10px]" style={{ color: t.sub }}>{l}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Location */}
      <Pressable className="flex-row items-center gap-2.5 p-3 rounded-xl" style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }}>
        <MapPin size={17} color={t.sub} />
        <Text className="flex-1 text-[13px]" style={{ color: t.sub }}>場所を設定</Text>
        <Locate size={15} color={t.sub} />
      </Pressable>

      {/* Submit */}
      <Pressable onPress={() => router.back()}>
        <LinearGradient colors={[t.accent, t.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="rounded-[14px] p-[15px] items-center">
          <Text className="text-black font-extrabold text-[15px]">投稿する</Text>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}
