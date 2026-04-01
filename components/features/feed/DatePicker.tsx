import { View, Text, Pressable, ScrollView } from "react-native";
import { Calendar } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface DateDay {
  offset: number;
  day: number;
  weekday: string;
  month: number;
  isWeekend: boolean;
}

interface DatePickerProps {
  t: ThemeTokens;
  selectedDate: number;
  onSelectDate: (offset: number) => void;
  getPostCount: (offset: number) => number;
}

/** 日付横スクロールピッカー */
export default function DatePicker({ t, selectedDate, onSelectDate, getPostCount }: DatePickerProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const dateDays: DateDay[] = Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const weekday = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
    return {
      offset: i,
      day: d.getDate(),
      weekday: weekday!,
      month: d.getMonth() + 1,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    };
  });

  const firstDay = dateDays[0]!;
  const lastDay = dateDays[dateDays.length - 1]!;
  const rangeLabel = firstDay.month === lastDay.month
    ? `${firstDay.month}/${firstDay.day}〜${lastDay.day}`
    : `${firstDay.month}/${firstDay.day}〜${lastDay.month}/${lastDay.day}`;

  return (
    <View style={{ backgroundColor: t.surface, borderBottomColor: t.border, borderBottomWidth: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, paddingTop: SPACE.sm, paddingLeft: SPACE.lg, paddingBottom: SPACE.xs }}>
        <Calendar size={14} color={t.accent} />
        <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }}>
          イベント日で探す
        </Text>
        <Text style={{ fontSize: fs.xxs, color: t.muted }}>
          {rangeLabel}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingHorizontal: SPACE.lg, paddingTop: SPACE.xs, paddingBottom: SPACE.md }}
      >
        {dateDays.map((dd) => {
          const active = selectedDate === dd.offset;
          const isToday = dd.offset === 0;
          const count = getPostCount(dd.offset);
          return (
            <Pressable
              key={dd.offset}
              onPress={() => onSelectDate(dd.offset)}
              style={({ pressed }) => ({
                width: 56,
                alignItems: "center",
                gap: 2,
                borderRadius: RADIUS.lg,
                paddingVertical: SPACE.sm,
                backgroundColor: active ? t.accent : "transparent",
                borderWidth: active ? 0 : 1,
                borderColor: active ? undefined : isToday ? t.accent + "50" : t.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              {isToday && (
                <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: active ? "#000" : t.accent, marginBottom: 1 }}>
                  今日
                </Text>
              )}
              {dd.offset === 1 && (
                <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: active ? "#000" : t.sub, marginBottom: 1 }}>
                  明日
                </Text>
              )}
              {dd.offset > 1 && (
                <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.semibold, color: active ? "#000" : dd.isWeekend ? t.red : t.muted }}>
                  {dd.weekday}
                </Text>
              )}
              <Text style={{ fontSize: fs.xxl, fontWeight: WEIGHT.extrabold, color: active ? "#000" : t.text }}>
                {dd.day}
              </Text>
              {count > 0 && (
                <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: active ? "#000" : t.accent }} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
