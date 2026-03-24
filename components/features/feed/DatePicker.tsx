import { View, Text, Pressable, ScrollView } from "react-native";
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
    <View style={{ backgroundColor: t.surface, borderBottomColor: t.border, borderBottomWidth: 1 }}>
      <View className="flex-row items-center gap-1 pt-2.5 pl-4 pb-1">
        <Calendar size={13} color={t.accent} />
        <Text className="text-xs font-bold" style={{ color: t.text }}>
          {dateDays[selectedDate]?.month}月
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-1 px-4 pt-1 pb-3">
        {dateDays.map((dd) => {
          const active = selectedDate === dd.offset;
          const isToday = dd.offset === 0;
          const count = getPostCount(dd.offset);
          return (
            <Pressable
              key={dd.offset}
              onPress={() => onSelectDate(dd.offset)}
              className={`w-12 items-center gap-0.5 rounded-[14px] py-2 ${active ? "bg-accent" : ""}`}
              style={!active ? { borderWidth: 1, borderColor: isToday ? t.accent + "50" : t.border } : undefined}
            >
              <Text className="text-[9px] font-semibold" style={{ color: active ? "#000" : dd.isWeekend ? t.red : t.muted }}>
                {dd.weekday}
              </Text>
              <Text className="text-lg font-extrabold" style={{ color: active ? "#000" : t.text }}>
                {dd.day}
              </Text>
              {count > 0 && <View className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: active ? "#000" : t.accent }} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
