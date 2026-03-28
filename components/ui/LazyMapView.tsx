import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { MapPin } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

/** react-native-maps を遅延import */
let MapView: any = null;
let Marker: any = null;
try {
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
} catch {
  // ビルドされていない場合は null
}

interface LazyMapViewProps {
  lat: number;
  lng: number;
  locationText?: string;
  t: ThemeTokens;
}

/**
 * Lv3: 遅延読み込みマップ
 * デフォルトは「地図で見る」ボタンのみ表示（課金ゼロ）
 * タップした時だけ MapView をマウント（$7/1000ロード）
 */
export default function LazyMapView({ lat, lng, locationText, t }: LazyMapViewProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const [showMap, setShowMap] = useState(false);

  const hasCoords = lat !== 0 || lng !== 0;
  const mapAvailable = hasCoords && !!MapView;

  if (showMap && mapAvailable) {
    return (
      <View style={{ borderRadius: RADIUS.xl, overflow: "hidden", borderWidth: 1, borderColor: t.border, marginBottom: SPACE.lg }}>
        <MapView
          style={{ width: "100%", height: 180 }}
          initialRegion={{
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          {Marker && (
            <Marker
              coordinate={{ latitude: lat, longitude: lng }}
              title={locationText}
            />
          )}
        </MapView>

        {/* 場所名オーバーレイ */}
        {locationText && (
          <View style={{ position: "absolute", bottom: SPACE.sm, left: SPACE.sm, right: SPACE.sm, flexDirection: "row", alignItems: "center", gap: SPACE.xs, backgroundColor: t.surface + "E6", borderRadius: RADIUS.md, padding: SPACE.sm, paddingHorizontal: SPACE.md }}>
            <MapPin size={12} color={t.accent} />
            <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: t.text }} numberOfLines={1}>{locationText}</Text>
          </View>
        )}

        {/* 閉じるボタン */}
        <Pressable
          onPress={() => setShowMap(false)}
          style={({ pressed }) => ({
            alignItems: "center",
            paddingVertical: SPACE.sm,
            backgroundColor: t.surface,
            borderTopWidth: 1,
            borderTopColor: t.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: t.muted }}>地図を閉じる</Text>
        </Pressable>
      </View>
    );
  }

  // デフォルト: テキスト + 「地図で見る」ボタン（座標がある時のみ）
  return (
    <Pressable
      onPress={mapAvailable ? () => setShowMap(true) : undefined}
      accessibilityLabel={mapAvailable ? "地図で場所を見る" : locationText ?? "場所"}
      accessibilityRole={mapAvailable ? "button" : "text"}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: SPACE.sm,
        paddingVertical: SPACE.md,
        paddingHorizontal: SPACE.lg,
        borderRadius: RADIUS.xl,
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.border,
        marginBottom: SPACE.lg,
        opacity: mapAvailable && pressed ? 0.7 : 1,
      })}
    >
      <MapPin size={16} color={t.accent} />
      <View style={{ flex: 1 }}>
        {locationText && (
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.text }}>{locationText}</Text>
        )}
        {mapAvailable && (
          <Text style={{ fontSize: fs.xxs, color: t.accent, marginTop: locationText ? 1 : 0 }}>タップで地図を表示</Text>
        )}
      </View>
    </Pressable>
  );
}
