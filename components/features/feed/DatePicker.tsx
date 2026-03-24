import { useRef } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Calendar } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";

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
  const dateDays: DateDay[] = Array.from({ length: 14 }, (_, i) => {
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

  return (
    <View style={[styles.container, { backgroundColor: t.surface, borderBottomColor: t.border }]}>
      <View style={styles.monthRow}>
        <Calendar size={13} color={t.accent} />
        <Text style={[styles.monthText, { color: t.text }]}>
          {dateDays[selectedDate]?.month}月
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {dateDays.map((dd) => {
          const active = selectedDate === dd.offset;
          const isToday = dd.offset === 0;
          const count = getPostCount(dd.offset);
          return (
            <Pressable key={dd.offset} onPress={() => onSelectDate(dd.offset)} style={[styles.chip, active && styles.chipActive, !active && { borderColor: isToday ? t.accent + "50" : t.border, borderWidth: 1 }]}>
              {active ? (
                <View style={styles.chipActiveInner}>
                  <Text style={[styles.weekday, { color: "#000" }]}>{dd.weekday}</Text>
                  <Text style={[styles.dayNum, { color: "#000" }]}>{dd.day}</Text>
                  {count > 0 && <View style={[styles.dot, { backgroundColor: "#000" }]} />}
                </View>
              ) : (
                <>
                  <Text style={[styles.weekday, { color: dd.isWeekend ? t.red : t.muted }]}>{dd.weekday}</Text>
                  <Text style={[styles.dayNum, { color: t.text }]}>{dd.day}</Text>
                  {count > 0 && <View style={[styles.dot, { backgroundColor: t.accent }]} />}
                </>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderBottomWidth: 1 },
  monthRow: { flexDirection: "row", alignItems: "center", gap: 4, paddingTop: 10, paddingLeft: 16, paddingBottom: 4 },
  monthText: { fontSize: 12, fontWeight: "700" },
  scrollContent: { gap: 4, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
  chip: { width: 48, paddingVertical: 8, borderRadius: 14, alignItems: "center", gap: 2 },
  chipActive: { backgroundColor: "#00D4A1", borderWidth: 0 },
  chipActiveInner: { alignItems: "center", gap: 2 },
  weekday: { fontSize: 9, fontWeight: "600" },
  dayNum: { fontSize: 18, fontWeight: "800" },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
});
