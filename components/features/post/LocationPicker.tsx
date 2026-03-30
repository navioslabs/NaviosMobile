import { View, Text, Pressable } from "react-native";
import { MapPin, Locate } from "@/lib/icons";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import type { ThemeTokens } from "@/constants/theme";
import type { SelectedPlace } from "@/components/ui/PlacePickerModal";

interface Props {
  selectedPlace: SelectedPlace | null;
  onClearPlace: () => void;
  onOpenPicker: () => void;
  granted: boolean;
  placeName: string | null;
  t: ThemeTokens;
  fs: Record<string, number>;
  sectionLabelStyle: any;
  cardStyle: any;
}

/** 位置情報選択UI（PlacePickerModal連携） */
export default function LocationPicker({
  selectedPlace,
  onClearPlace,
  onOpenPicker,
  granted,
  placeName,
  t,
  fs,
  sectionLabelStyle,
  cardStyle,
}: Props) {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.sm }}>
        <Text style={sectionLabelStyle}>場所</Text>
        <Text style={{ fontSize: fs.xxs, color: t.muted }}>任意</Text>
      </View>

      {selectedPlace ? (
        <View style={[cardStyle, { flexDirection: "row" as const, alignItems: "center" as const, gap: SPACE.sm + 2 }]}>
          <MapPin size={18} color={t.accent} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: t.text }}>{selectedPlace.name}</Text>
            {selectedPlace.address ? (
              <Text style={{ fontSize: fs.xs, color: t.sub, marginTop: 1 }}>{selectedPlace.address}</Text>
            ) : null}
          </View>
          <Pressable onPress={onClearPlace} hitSlop={8}>
            <Text style={{ fontSize: fs.xs, color: t.muted }}>変更</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ gap: SPACE.sm }}>
          {/* Lv1: 現在地で投稿 */}
          <View style={[cardStyle, { flexDirection: "row" as const, alignItems: "center" as const, gap: SPACE.sm + 2 }]}>
            <Locate size={18} color={granted ? t.accent : t.sub} />
            <Text style={{ flex: 1, fontSize: fs.sm, color: granted ? t.text : t.sub }}>
              {granted ? `📍 ${placeName ?? "位置情報を取得中..."}` : "位置情報が許可されていません"}
            </Text>
            {granted && (
              <View style={{ backgroundColor: t.accent + "20", borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm + 2, paddingVertical: 2 }}>
                <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: t.accent }}>自動</Text>
              </View>
            )}
          </View>

          {/* Lv2: 場所を検索 */}
          <Pressable
            onPress={onOpenPicker}
            style={({ pressed }) => ({
              flexDirection: "row" as const,
              alignItems: "center" as const,
              gap: SPACE.sm + 2,
              paddingVertical: SPACE.md,
              paddingHorizontal: SPACE.lg,
              borderRadius: RADIUS.xl,
              borderWidth: 1,
              borderStyle: "dashed" as const,
              borderColor: t.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <MapPin size={16} color={t.sub} />
            <Text style={{ fontSize: fs.sm, color: t.sub }}>別の場所を検索して指定</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
