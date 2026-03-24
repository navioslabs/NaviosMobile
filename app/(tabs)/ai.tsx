import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Search, Mic, Zap, MapPin } from "@/lib/icons";
import { makeTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FEED_POSTS } from "@/data/mockData";
import PulseScoreCard from "@/components/features/ai/PulseScoreCard";
import QuickActions from "@/components/features/ai/QuickActions";
import PulseEventCard from "@/components/features/ai/PulseEventCard";

/** AI画面 */
export default function AiScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = makeTokens(isDark);
  const [query, setQuery] = useState("");

  const pulseEvents = [...FEED_POSTS].sort((a, b) => a.timeLeft - b.timeLeft).slice(0, 4);

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: t.bg }} contentContainerClassName="p-5 pb-[100px]" showsVerticalScrollIndicator={false}>
      {/* Logo */}
      <View className="items-center mb-6">
        <LinearGradient colors={[t.accent, t.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="w-14 h-14 rounded-[18px] items-center justify-center mb-3">
          <Sparkles size={26} color="#fff" />
        </LinearGradient>
        <Text className="text-2xl font-extrabold tracking-tight" style={{ color: t.text }}>Navios AI</Text>
        <Text className="text-xs mt-[3px]" style={{ color: t.sub }}>あなたの地域を、もっとスマートに</Text>
      </View>

      {/* Search */}
      <View className="flex-row items-center rounded-2xl p-3 gap-2.5 mb-6" style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }}>
        <Search size={17} color={t.sub} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="何をお探しですか？"
          placeholderTextColor={t.sub}
          className="flex-1 text-sm"
          style={{ color: t.text }}
        />
        <Pressable>
          <LinearGradient colors={[t.accent, t.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="w-9 h-9 rounded-full items-center justify-center">
            <Mic size={15} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>

      <PulseScoreCard t={t} isDark={isDark} />
      <QuickActions t={t} isDark={isDark} />

      {/* Pulse Feed */}
      <View className="mb-5">
        <View className="flex-row items-center justify-between mb-2.5">
          <View className="flex-row items-center gap-[5px]">
            <Zap size={14} color={t.accent} />
            <Text className="text-[13px] font-bold" style={{ color: t.text }}>今すぐ行くべき順</Text>
          </View>
          <Text className="text-[10px] font-semibold" style={{ color: t.accent }}>リアルタイム</Text>
        </View>
        <View className="gap-2.5">
          {pulseEvents.map((ev) => (
            <PulseEventCard key={ev.id} event={ev} t={t} />
          ))}
        </View>
      </View>

      {/* Auto check-in */}
      <View
        className="flex-row items-center gap-3 rounded-2xl p-3.5"
        style={{ backgroundColor: isDark ? "#0F1A14" : "#EAF9F4", borderWidth: 1, borderColor: t.accent + "28" }}
      >
        <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: t.accent + "20" }}>
          <MapPin size={20} color={t.accent} />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-bold" style={{ color: t.text }}>AIオートチェックイン</Text>
          <Text className="text-[11px] leading-[15px]" style={{ color: t.sub }}>現地に近づいたら自動で通知</Text>
        </View>
        <Pressable className="rounded-pill px-3 py-1.5 bg-accent">
          <Text className="text-[11px] font-bold text-black">ON</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
