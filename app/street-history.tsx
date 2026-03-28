import { useMemo } from "react";
import { View, Text, SectionList, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, Clock, MapPin } from "@/lib/icons";
import { useLocation } from "@/hooks/useLocation";
import { useStreetHistory } from "@/hooks/useStreetHistory";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import StreetHistoryCard from "@/components/features/history/StreetHistoryCard";
import { useThemeStore } from "@/stores/themeStore";
import type { StreetHistoryItem } from "@/types";

interface Section {
  title: string;
  data: StreetHistoryItem[];
}

/** 月ごとにグループ化 */
function groupByMonth(items: StreetHistoryItem[]): Section[] {
  const groups: Record<string, StreetHistoryItem[]> = {};
  for (const item of items) {
    const d = new Date(item.created_at);
    const key = `${d.getFullYear()}年${d.getMonth() + 1}月`;
    (groups[key] ??= []).push(item);
  }
  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

/** 街の記憶画面 */
export default function StreetHistoryScreen() {
  const { s, t, fs } = useAppStyles();
  const { isDark } = useThemeStore();
  const { lat, lng, isLoading: locLoading } = useLocation();
  const { data: items, isLoading } = useStreetHistory(lat, lng);

  const sections = useMemo(() => groupByMonth(items ?? []), [items]);

  return (
    <View style={s.screen}>
      {/* ヘッダー */}
      <View style={{
        flexDirection: "row", alignItems: "center", gap: SPACE.md,
        paddingHorizontal: SPACE.lg, paddingTop: 52, paddingBottom: SPACE.md,
        backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.border,
      }}>
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
          style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}
        >
          <ChevronLeft size={24} color={t.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.textHeading}>この場所の記憶</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 }}>
            <MapPin size={10} color={t.accent} />
            <Text style={{ fontSize: fs.xs, color: t.muted }}>半径500m以内の人気投稿</Text>
          </View>
        </View>
      </View>

      {(locLoading || isLoading) && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={t.accent} />
          <Text style={{ fontSize: fs.sm, color: t.muted, marginTop: SPACE.md }}>
            {locLoading ? "位置情報を取得中..." : "記憶を読み込み中..."}
          </Text>
        </View>
      )}

      {!locLoading && !isLoading && sections.length === 0 && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: SPACE.xl }}>
          <Clock size={48} color={t.muted} />
          <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.sub, marginTop: SPACE.lg, textAlign: "center" }}>
            まだ記憶がありません
          </Text>
          <Text style={{ fontSize: fs.sm, color: t.muted, marginTop: SPACE.sm, textAlign: "center", lineHeight: 20 }}>
            この場所で投稿が人気になると{"\n"}街の記憶として残ります
          </Text>
        </View>
      )}

      {sections.length > 0 && (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: SPACE.lg }}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section }) => (
            <View style={{
              flexDirection: "row", alignItems: "center", gap: SPACE.sm,
              paddingVertical: SPACE.sm, marginBottom: SPACE.sm, marginTop: SPACE.md,
            }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.accent }} />
              <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: t.text }}>
                {section.title}
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: t.border, marginLeft: SPACE.sm }} />
            </View>
          )}
          renderItem={({ item }) => (
            <StreetHistoryCard item={item} t={t} isDark={isDark} />
          )}
        />
      )}
    </View>
  );
}
