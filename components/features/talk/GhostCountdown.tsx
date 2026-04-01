import { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Timer } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import { GHOST_DURATION_MS } from "@/constants/ghost";

const SIX_HOURS_MS = 6 * 3600000;
const ONE_HOUR_MS = 3600000;
const PROGRESS_BAR_WIDTH = 40;

interface GhostCountdownProps {
  createdAt: string;
  t: ThemeTokens;
}

/** 残り時間を「○時間○分」形式に変換 */
function formatRemaining(ms: number): string {
  if (ms <= 0) return "まもなく消えます";
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `あと${hours}時間${mins}分`;
  return `あと${mins}分`;
}

/** ゴースト投稿のカウントダウン表示 + プログレスバー */
export default function GhostCountdown({ createdAt, t }: GhostCountdownProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);

  const [remaining, setRemaining] = useState(() => {
    const elapsed = Date.now() - new Date(createdAt).getTime();
    return Math.max(0, GHOST_DURATION_MS - elapsed);
  });

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Date.now() - new Date(createdAt).getTime();
      setRemaining(Math.max(0, GHOST_DURATION_MS - elapsed));
    }, 60000);
    return () => clearInterval(id);
  }, [createdAt]);

  const color = remaining > SIX_HOURS_MS ? t.muted : remaining > ONE_HOUR_MS ? t.amber : t.red;
  const ratio = Math.max(0, remaining / GHOST_DURATION_MS);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Timer size={11} color={color} />
      {/* プログレスバー */}
      <View style={{ width: PROGRESS_BAR_WIDTH, height: 3, borderRadius: 2, backgroundColor: t.border, overflow: "hidden" }}>
        <View style={{ width: PROGRESS_BAR_WIDTH * ratio, height: 3, borderRadius: 2, backgroundColor: color }} />
      </View>
      <Text style={{ fontSize: fs.xxs, color, fontWeight: WEIGHT.semibold }}>
        {formatRemaining(remaining)}
      </Text>
    </View>
  );
}
