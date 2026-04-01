import { useRef, useEffect, useState } from "react";
import { View, Text, Pressable, Animated, Easing, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, ThumbsUp, MessageCircle, TrendingUp, Radio, Flame, Zap, Clock, RefreshCw } from "@/lib/icons";
import { useDigest } from "@/hooks/useDigest";
import { CAT_CONFIG, type CategoryId } from "@/constants/categories";
import type { ThemeTokens } from "@/constants/theme";
import type { DigestHighlight } from "@/lib/digest";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";

interface DailyDigestCardProps {
  t: ThemeTokens;
  fs: { xxs: number; xs: number; sm: number; base: number; lg: number; xl: number };
  isDark: boolean;
  placeName: string | null;
  /** PULSEスコア（ScanHeaderから統合） */
  pulseScore: number;
  postCount: number;
  isWatching?: boolean;
  dataUpdatedAt?: number;
  /** 「記憶を見る」押下時 */
  onHistoryPress?: () => void;
  /** 「更新」押下時 */
  onRefresh?: () => void;
  /** 更新中フラグ */
  isRefreshing?: boolean;
}

// ─── スコア帯 ──────────────────────────────────────

interface ScoreTier {
  label: string;
  badge: string | null;
  color: string;
  icon: typeof Radio;
  pulsePeriod: number;
}

function getScoreTier(score: number): ScoreTier {
  if (score >= 80) return { label: "かなり活発", badge: "VERY HOT", color: "#FF6B35", icon: Flame, pulsePeriod: 1000 };
  if (score >= 60) return { label: "盛り上がっています", badge: "HOT", color: "#00D4A1", icon: Zap, pulsePeriod: 1200 };
  if (score >= 30) return { label: "スキャン中", badge: null, color: "#00D4A1", icon: Radio, pulsePeriod: 1600 };
  return { label: "静かなエリア", badge: null, color: "#5E5D78", icon: Radio, pulsePeriod: 2000 };
}

// ─── アニメーション ────────────────────────────────

function usePulse(periodMs: number) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: periodMs, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [periodMs]);
  return anim;
}

function useCountUp(target: number, duration = 600) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: target, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [target]);
  return anim;
}

// ─── 日付 ──────────────────────────────────────────

function formatDateLabel(): string {
  const d = new Date();
  const weekday = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}（${weekday}）`;
}

// ─── PULSEリング ───────────────────────────────────

function PulseRing({ color, periodMs }: { color: string; periodMs: number }) {
  const anim = usePulse(periodMs);
  const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.4, 1] });
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0, 0.4] });
  return (
    <Animated.View style={{
      position: "absolute",
      width: 56, height: 56, borderRadius: 28,
      borderWidth: 2, borderColor: color,
      transform: [{ scale }], opacity,
    }} />
  );
}

// ─── スコアアーク ──────────────────────────────────

function ScoreArc({ score, color, t }: { score: number; color: string; t: ThemeTokens }) {
  const progress = Math.min(score / 100, 1);
  return (
    <View style={{ width: 56, height: 56, alignItems: "center", justifyContent: "center" }}>
      {/* トラック */}
      <View style={[styles.arcTrack, { borderColor: t.surface3 }]} />
      {/* 充填（疑似的にborderで表現） */}
      <View style={[styles.arcFill, {
        borderColor: color,
        borderTopColor: progress > 0.25 ? color : "transparent",
        borderRightColor: progress > 0.5 ? color : "transparent",
        borderBottomColor: progress > 0.75 ? color : "transparent",
        borderLeftColor: progress > 0 ? color : "transparent",
        transform: [{ rotate: "-90deg" }],
      }]} />
      {/* 中心 */}
      <View style={[styles.arcCenter, { backgroundColor: t.bg }]} />
    </View>
  );
}

// ─── ハイライトカード ──────────────────────────────

function HighlightCard({ item, t, fs, isDark }: { item: DigestHighlight; t: ThemeTokens; fs: DailyDigestCardProps["fs"]; isDark: boolean }) {
  const cat = CAT_CONFIG[item.category as CategoryId];
  return (
    <Pressable
      onPress={() => router.push(`/feed/${item.id}`)}
      style={({ pressed }) => ({
        width: 200,
        borderRadius: RADIUS.xl,
        overflow: "hidden",
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {/* 画像 or プレースホルダー */}
      <View style={{ height: 110, backgroundColor: t.surface2 }}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={{ width: 200, height: 110 }} contentFit="cover" />
        ) : (
          <LinearGradient
            colors={cat ? [cat.color + "30", cat.color + "08"] : [t.surface2, t.surface3]}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <MapPin size={28} color={cat?.color ?? t.muted} />
          </LinearGradient>
        )}
        {/* オーバーレイグラデーション */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, justifyContent: "flex-end", padding: SPACE.sm }}
        >
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: "#fff" }} numberOfLines={2}>{item.title}</Text>
        </LinearGradient>
        {/* カテゴリバッジ */}
        {cat && (
          <View style={{ position: "absolute", top: SPACE.sm, left: SPACE.sm, backgroundColor: cat.color, borderRadius: RADIUS.sm, paddingHorizontal: SPACE.xs + 2, paddingVertical: 2 }}>
            <Text style={{ fontSize: 9, fontWeight: WEIGHT.extrabold, color: "#000" }}>{cat.label}</Text>
          </View>
        )}
      </View>
      {/* メタ情報 */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs + 2, backgroundColor: t.surface, borderWidth: 1, borderTopWidth: 0, borderColor: t.border, borderBottomLeftRadius: RADIUS.xl, borderBottomRightRadius: RADIUS.xl }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
          <ThumbsUp size={11} color={t.accent} />
          <Text style={{ fontSize: fs.xxs, color: t.sub, fontWeight: WEIGHT.semibold }}>{item.likes_count}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
          <MessageCircle size={11} color={t.blue} />
          <Text style={{ fontSize: fs.xxs, color: t.sub, fontWeight: WEIGHT.semibold }}>{item.comments_count}</Text>
        </View>
        {item.location_text && (
          <Text style={{ fontSize: fs.xxs, color: t.muted, flex: 1 }} numberOfLines={1}>{item.location_text}</Text>
        )}
      </View>
    </Pressable>
  );
}

// ─── メインコンポーネント ──────────────────────────

/** デイリーダイジェスト + PULSEエリア統合ヘッダー */
export default function DailyDigestCard({ t, fs, isDark, placeName, pulseScore, postCount, isWatching = false, dataUpdatedAt, onHistoryPress, onRefresh, isRefreshing = false }: DailyDigestCardProps) {
  const { data } = useDigest();
  const tier = getScoreTier(pulseScore);
  const TierIcon = tier.icon;
  const isHot = pulseScore >= 60;
  const isVeryHot = pulseScore >= 80;

  const scoreAnim = useCountUp(pulseScore);
  const liveAnim = usePulse(tier.pulsePeriod);
  const liveOpacity = liveAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.5, 1] });

  const areaName = placeName?.split(" ")[0] ?? "このエリア";
  const updatedTime = dataUpdatedAt ? new Date(dataUpdatedAt) : new Date();
  const timeStr = `${updatedTime.getHours()}:${String(updatedTime.getMinutes()).padStart(2, "0")}`;

  const diff = data ? data.today_count - data.yesterday_count : 0;
  const hasTags = (data?.trending_tags.length ?? 0) > 0;
  const hasHighlights = (data?.highlights.length ?? 0) > 0;
  const hasStats = (data?.my_stats.post_count ?? 0) > 0;

  const bgColors: [string, string, string] = isVeryHot
    ? (isDark ? ["rgba(255,107,53,0.10)", "rgba(255,107,53,0.03)", t.bg] : ["rgba(255,107,53,0.06)", "rgba(255,107,53,0.02)", t.bg])
    : isHot
      ? (isDark ? ["rgba(0,232,176,0.08)", "rgba(0,232,176,0.02)", t.bg] : ["rgba(0,212,161,0.05)", "rgba(0,212,161,0.01)", t.bg])
      : [t.bg, t.bg, t.bg];

  return (
    <LinearGradient colors={bgColors} locations={[0, 0.6, 1]}>
      <View style={{ paddingHorizontal: SPACE.xl, paddingTop: SPACE.md, paddingBottom: SPACE.lg, gap: SPACE.lg }}>

        {/* ── 1行目: 地名 + 日付 + LIVE ── */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
              <MapPin size={14} color={tier.color} />
              <Text style={{ fontSize: fs.xs, color: t.muted, fontWeight: WEIGHT.semibold, letterSpacing: 0.5 }}>
                {formatDateLabel()}
              </Text>
            </View>
            <Text style={{ fontSize: fs.xl + 2, fontWeight: WEIGHT.extrabold, color: t.text, marginTop: 2, letterSpacing: -0.3 }}>
              {areaName}のきょう
            </Text>
          </View>
          {/* アクションボタン + LIVE */}
          <View style={{ alignItems: "flex-end", gap: SPACE.xs }}>
            {/* LIVEインジケーター */}
            {isWatching && (
              <Animated.View style={{ flexDirection: "row", alignItems: "center", gap: 4, opacity: liveOpacity }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tier.color }} />
                <Text style={{ fontSize: 10, fontWeight: WEIGHT.extrabold, color: tier.color, letterSpacing: 1 }}>LIVE</Text>
              </Animated.View>
            )}
            {/* コンパクトアクションボタン */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
              {onHistoryPress && (
                <Pressable
                  onPress={onHistoryPress}
                  style={({ pressed }) => ({
                    flexDirection: "row", alignItems: "center", gap: 4,
                    paddingVertical: SPACE.xs, paddingHorizontal: SPACE.sm + 2,
                    borderRadius: RADIUS.full, backgroundColor: t.surface,
                    borderWidth: 1, borderColor: t.border, opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Clock size={12} color={t.accent} />
                  <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.semibold, color: t.accent }}>記憶を見る</Text>
                </Pressable>
              )}
              {onRefresh && (
                <Pressable
                  onPress={onRefresh}
                  style={({ pressed }) => ({
                    flexDirection: "row", alignItems: "center", gap: 3,
                    paddingVertical: SPACE.xs, paddingHorizontal: SPACE.sm,
                    borderRadius: RADIUS.full,
                    backgroundColor: isRefreshing ? tier.color + "18" : t.surface,
                    borderWidth: 1, borderColor: isRefreshing ? tier.color + "40" : t.border,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <RefreshCw size={12} color={isRefreshing ? tier.color : t.accent} />
                  <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.semibold, color: isRefreshing ? tier.color : t.accent }}>
                    {isRefreshing ? "更新中" : "更新"}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* ── 2行目: PULSEスコア + ステータス ── */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.lg }}>
          {/* スコアリング */}
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <PulseRing color={tier.color} periodMs={tier.pulsePeriod} />
            <ScoreArc score={pulseScore} color={tier.color} t={t} />
            <View style={{ position: "absolute", alignItems: "center" }}>
              <AnimatedScore value={scoreAnim} color={tier.color} fs={fs} />
              <Text style={{ fontSize: 7, fontWeight: WEIGHT.bold, color: t.muted, letterSpacing: 1.5, marginTop: -1 }}>PULSE</Text>
            </View>
          </View>

          {/* ステータス情報 */}
          <View style={{ flex: 1, gap: SPACE.xs }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
              <TierIcon size={14} color={tier.color} />
              <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: t.text }}>{tier.label}</Text>
              {tier.badge && (
                <View style={{ backgroundColor: tier.color, borderRadius: RADIUS.sm, paddingHorizontal: SPACE.xs + 2, paddingVertical: 1 }}>
                  <Text style={{ fontSize: 9, fontWeight: WEIGHT.extrabold, color: "#000" }}>{tier.badge}</Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: fs.xs, color: t.muted }}>
              {postCount}件の情報 · {timeStr} 更新
            </Text>
            {/* 投稿数の増減 */}
            {data && diff !== 0 && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
                <View style={{
                  width: 16, height: 16, borderRadius: 8,
                  backgroundColor: diff > 0 ? "#00D4A1" + "20" : "#F5A623" + "20",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Text style={{ fontSize: 9, fontWeight: WEIGHT.extrabold, color: diff > 0 ? "#00D4A1" : "#F5A623" }}>
                    {diff > 0 ? "+" : ""}
                  </Text>
                </View>
                <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: diff > 0 ? "#00D4A1" : "#F5A623" }}>
                  昨日比 {diff > 0 ? `+${diff}` : diff}件
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── 3行目: トレンドタグ ── */}
        {hasTags && data && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs, flexWrap: "wrap" }}>
            <TrendingUp size={12} color={t.muted} />
            {data.trending_tags.map((tag) => (
              <View key={tag} style={{
                paddingHorizontal: SPACE.sm + 2,
                paddingVertical: SPACE.xs,
                borderRadius: RADIUS.full,
                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                borderWidth: 1,
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              }}>
                <Text style={{ fontSize: fs.xs, color: t.sub, fontWeight: WEIGHT.semibold }}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── 4行目: ハイライトカード ── */}
        {hasHighlights && data && (
          <View style={{ gap: SPACE.sm }}>
            <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.bold, color: t.muted, letterSpacing: 0.8 }}>
              HIGHLIGHTS
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: SPACE.md }}
            >
              {data.highlights.map((item) => (
                <HighlightCard key={item.id} item={item} t={t} fs={fs} isDark={isDark} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── 投稿0件の場合 ── */}
        {postCount === 0 && (
          <Pressable
            onPress={() => router.push("/post")}
            style={({ pressed }) => ({
              alignItems: "center",
              paddingVertical: SPACE.md,
              borderRadius: RADIUS.lg,
              backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
              borderWidth: 1,
              borderColor: t.border,
              borderStyle: "dashed",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: fs.sm, color: t.sub }}>静かな一日です</Text>
            <Text style={{ fontSize: fs.sm, color: t.accent, fontWeight: WEIGHT.bold, marginTop: SPACE.xs }}>
              最初の投稿をしてみよう
            </Text>
          </Pressable>
        )}

        {/* ── 自分のアクティビティ ── */}
        {hasStats && data && (
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: SPACE.md,
            paddingTop: SPACE.sm,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: t.border,
          }}>
            <Text style={{ fontSize: fs.xxs, color: t.muted, fontWeight: WEIGHT.semibold, letterSpacing: 0.5 }}>MY 7DAYS</Text>
            <Stat icon={<MapPin size={10} color={t.sub} />} value={`${data.my_stats.post_count}`} t={t} fs={fs} />
            <Stat icon={<ThumbsUp size={10} color={t.accent} />} value={`${data.my_stats.total_likes}`} t={t} fs={fs} />
            <Stat icon={<MessageCircle size={10} color={t.blue} />} value={`${data.my_stats.total_comments}`} t={t} fs={fs} />
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

// ─── 小パーツ ──────────────────────────────────────

function Stat({ icon, value, t, fs }: { icon: React.ReactNode; value: string; t: ThemeTokens; fs: DailyDigestCardProps["fs"] }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      {icon}
      <Text style={{ fontSize: fs.xs, color: t.sub, fontWeight: WEIGHT.semibold }}>{value}</Text>
    </View>
  );
}

/** カウントアップするスコア数値 */
function AnimatedScore({ value, color, fs }: { value: Animated.Value; color: string; fs: DailyDigestCardProps["fs"] }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const id = value.addListener(({ value: v }) => setDisplay(Math.round(v)));
    return () => value.removeListener(id);
  }, [value]);
  return (
    <Text style={{ fontSize: fs.xl, fontWeight: WEIGHT.extrabold, color }}>
      {display}
    </Text>
  );
}

// ─── Stickyミニバー ────────────────────────────────

interface DigestMiniBarProps {
  t: ThemeTokens;
  fs: DailyDigestCardProps["fs"];
  isDark: boolean;
  placeName: string | null;
  pulseScore: number;
  postCount: number;
  /** Animated.Value（0=非表示, 1=表示） */
  animValue: Animated.Value;
  onPress: () => void;
}

/** スクロール時に表示されるコンパクトダイジェストバー */
export function DigestMiniBar({ t, fs, isDark, placeName, pulseScore, postCount, animValue, onPress }: DigestMiniBarProps) {
  const tier = getScoreTier(pulseScore);
  const areaName = placeName?.split(" ")[0] ?? "このエリア";

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-44, 0],
  });
  const opacity = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Animated.View style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      transform: [{ translateY }],
      opacity,
    }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: SPACE.sm,
          paddingHorizontal: SPACE.xl,
          paddingVertical: SPACE.sm,
          backgroundColor: isDark ? "rgba(14,14,24,0.95)" : "rgba(255,255,255,0.95)",
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: t.border,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        {/* スコアドット */}
        <View style={{
          width: 28, height: 28, borderRadius: 14,
          backgroundColor: tier.color + "18",
          alignItems: "center", justifyContent: "center",
          borderWidth: 1.5, borderColor: tier.color + "40",
        }}>
          <Text style={{ fontSize: 11, fontWeight: WEIGHT.extrabold, color: tier.color }}>
            {pulseScore}
          </Text>
        </View>

        {/* エリア名 */}
        <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text, flex: 1 }} numberOfLines={1}>
          {areaName}
        </Text>

        {/* 件数 */}
        <Text style={{ fontSize: fs.xs, color: t.muted }}>
          {postCount}件
        </Text>

        {/* バッジ */}
        {tier.badge && (
          <View style={{
            backgroundColor: tier.color,
            borderRadius: RADIUS.sm,
            paddingHorizontal: SPACE.xs + 2,
            paddingVertical: 1,
          }}>
            <Text style={{ fontSize: 8, fontWeight: WEIGHT.extrabold, color: "#000" }}>{tier.badge}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ─── スタイル ──────────────────────────────────────

const styles = StyleSheet.create({
  arcTrack: {
    position: "absolute",
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 3,
  },
  arcFill: {
    position: "absolute",
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 3,
  },
  arcCenter: {
    position: "absolute",
    width: 46, height: 46, borderRadius: 23,
  },
});
