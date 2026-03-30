import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, Clock } from "@/lib/icons";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import type { ThemeTokens } from "@/constants/theme";
import type { CategoryId } from "@/constants/categories";

/** カテゴリ別の掲載期限ラベル */
const DEADLINE_LABELS: Record<CategoryId, string> = {
  lifeline: "掲載期限",
  event: "開催日時",
  help: "掲載期限",
};

/** クイック選択チップの定義 */
type QuickChipId = "today" | "tomorrow" | "week" | "custom";
const QUICK_CHIPS: { id: QuickChipId; label: string }[] = [
  { id: "today", label: "今日中" },
  { id: "tomorrow", label: "明日まで" },
  { id: "week", label: "今週中" },
  { id: "custom", label: "日時を選ぶ" },
];

/** チップIDから Date を生成 */
const chipToDate = (id: QuickChipId): Date | null => {
  const d = new Date();
  if (id === "today") { d.setHours(23, 59, 0, 0); return d; }
  if (id === "tomorrow") { d.setDate(d.getDate() + 1); d.setHours(23, 59, 0, 0); return d; }
  if (id === "week") {
    const day = d.getDay();
    d.setDate(d.getDate() + (7 - day));
    d.setHours(23, 59, 0, 0);
    return d;
  }
  return null;
};

/** 最大14日後 */
const maxDeadline = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  d.setHours(23, 59, 0, 0);
  return d;
};

/** 日付フォーマット */
const fmtDeadline = (d: Date): string => {
  const mo = d.getMonth() + 1;
  const da = d.getDate();
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const today = new Date();
  if (da === today.getDate() && mo === today.getMonth() + 1) return `今日 ${h}:${m}まで`;
  const tmr = new Date(); tmr.setDate(tmr.getDate() + 1);
  if (da === tmr.getDate() && mo === tmr.getMonth() + 1) return `明日 ${h}:${m}まで`;
  return `${mo}/${da} ${h}:${m}まで`;
};

interface Props {
  category: CategoryId;
  deadline: Date | undefined;
  selectedChip: QuickChipId | null;
  showPicker: boolean;
  onChipPress: (id: QuickChipId) => void;
  onDateChange: (event: any, selected?: Date) => void;
  error?: string;
  t: ThemeTokens;
  fs: Record<string, number>;
  isDark: boolean;
  sectionLabelStyle: any;
}

/** 期限選択UI（クイックチップ + DateTimePicker） */
export default function DeadlineSelector({
  category,
  deadline,
  selectedChip,
  showPicker,
  onChipPress,
  onDateChange,
  error,
  t,
  fs,
  isDark,
  sectionLabelStyle,
}: Props) {
  return (
    <View>
      <Text style={[sectionLabelStyle, { marginBottom: SPACE.xs }]}>
        {DEADLINE_LABELS[category]} <Text style={{ color: t.red }}>*</Text>
      </Text>
      <Text style={{ fontSize: fs.xxs, color: t.muted, marginBottom: SPACE.sm }}>最大2週間後まで設定できます</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACE.sm }}>
        {QUICK_CHIPS.map((chip) => {
          const active = selectedChip === chip.id;
          return (
            <Pressable
              key={chip.id}
              onPress={() => onChipPress(chip.id)}
              style={({ pressed }) => ({
                flexDirection: "row" as const,
                alignItems: "center" as const,
                gap: 5,
                paddingHorizontal: SPACE.md,
                paddingVertical: SPACE.sm,
                borderRadius: RADIUS.full,
                borderWidth: active ? 2 : 1,
                borderColor: active ? t.accent : t.border,
                backgroundColor: active ? t.accent + "18" : t.surface,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              {chip.id === "custom" ? (
                <Calendar size={14} color={active ? t.accent : t.sub} />
              ) : (
                <Clock size={14} color={active ? t.accent : t.sub} />
              )}
              <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: active ? t.accent : t.sub }}>
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {deadline && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginTop: SPACE.sm, paddingHorizontal: SPACE.xs }}>
          <Calendar size={14} color={t.accent} />
          <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: t.accent }}>{fmtDeadline(deadline)}</Text>
        </View>
      )}
      {error && <Text style={{ fontSize: fs.xxs, color: t.red, marginTop: SPACE.xs }}>{error}</Text>}
      {showPicker && (
        <View
          style={{
            marginTop: SPACE.sm,
            borderRadius: RADIUS.lg,
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.border,
            overflow: "hidden",
          }}
        >
          <DateTimePicker
            value={deadline ?? new Date()}
            mode="datetime"
            display="spinner"
            minimumDate={new Date()}
            maximumDate={maxDeadline()}
            onChange={onDateChange}
            locale="ja"
            themeVariant={isDark ? "dark" : "light"}
            textColor={t.text}
            accentColor={t.accent}
            style={{ backgroundColor: t.surface }}
          />
        </View>
      )}
    </View>
  );
}

export { chipToDate };
export type { QuickChipId };
