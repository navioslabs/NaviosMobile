import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TextInput, Pressable, Modal, FlatList, ActivityIndicator, Platform } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { MapPin, Search, X, Navigation } from "@/lib/icons";
import { searchPlaces, hasGoogleApiKey } from "@/lib/places";
import type { PlacePrediction } from "@/lib/places";
import type { ThemeTokens } from "@/constants/theme";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

/** 場所選択の結果（Place Details不使用、テキストのみ） */
export interface SelectedPlace {
  name: string;
  address: string;
}

interface PlacePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (place: SelectedPlace) => void;
  t: ThemeTokens;
  currentLat?: number;
  currentLng?: number;
}

/** 場所選択モーダル（Lv2: Places Autocomplete のみ） */
export default function PlacePickerModal({
  visible,
  onClose,
  onSelect,
  t,
  currentLat,
  currentLng,
}: PlacePickerModalProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiAvailable = hasGoogleApiKey();

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (text.trim().length < 2) {
      setPredictions([]);
      return;
    }
    setIsSearching(true);
    timerRef.current = setTimeout(async () => {
      const results = await searchPlaces(text.trim(), currentLat, currentLng);
      setPredictions(results);
      setIsSearching(false);
    }, 300);
  }, [currentLat, currentLng]);

  const handleSelectPrediction = (p: PlacePrediction) => {
    onSelect({ name: p.mainText, address: p.secondaryText });
    resetAndClose();
  };

  const resetAndClose = () => {
    setQuery("");
    setPredictions([]);
    onClose();
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  if (!visible) return null;

  // APIキー未設定
  if (!apiAvailable) {
    return (
      <Modal visible transparent animationType="none" onRequestClose={resetAndClose}>
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: SPACE.xl }}>
          <Animated.View
            entering={SlideInDown.duration(300)}
            exiting={SlideOutDown.duration(200)}
            style={{ width: "100%", backgroundColor: t.surface, borderRadius: RADIUS.xxl, padding: SPACE.xl, alignItems: "center" }}
          >
            <MapPin size={32} color={t.muted} />
            <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text, marginTop: SPACE.md }}>
              場所検索は準備中です
            </Text>
            <Text style={{ fontSize: fs.sm, color: t.sub, textAlign: "center", marginTop: SPACE.sm, lineHeight: 20 }}>
              現在地の自動取得は有効です
            </Text>
            <Pressable
              onPress={resetAndClose}
              style={({ pressed }) => ({
                marginTop: SPACE.xl, paddingHorizontal: SPACE.xxl, paddingVertical: SPACE.md,
                borderRadius: RADIUS.lg, backgroundColor: t.accent, opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: "#000" }}>閉じる</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }

  return (
    <Modal visible transparent animationType="none" onRequestClose={resetAndClose}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(200)}
          style={{
            flex: 1,
            marginTop: Platform.OS === "ios" ? 60 : 40,
            backgroundColor: t.surface,
            borderTopLeftRadius: RADIUS.xxl,
            borderTopRightRadius: RADIUS.xxl,
            overflow: "hidden",
          }}
        >
          {/* ヘッダー */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.md, padding: SPACE.lg, borderBottomWidth: 1, borderBottomColor: t.border }}>
            <Pressable onPress={resetAndClose} hitSlop={8}>
              <X size={22} color={t.sub} />
            </Pressable>
            <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text, flex: 1 }}>場所を検索</Text>
          </View>

          {/* 検索バー */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, margin: SPACE.lg, padding: SPACE.md, borderRadius: RADIUS.lg, backgroundColor: t.surface2, borderWidth: 1, borderColor: t.border }}>
            {isSearching ? (
              <ActivityIndicator size={16} color={t.accent} />
            ) : (
              <Search size={16} color={t.sub} />
            )}
            <TextInput
              value={query}
              onChangeText={handleSearch}
              placeholder="店名・施設名・住所で検索..."
              placeholderTextColor={t.muted}
              autoFocus
              returnKeyType="search"
              style={{ flex: 1, fontSize: fs.base, color: t.text }}
            />
            {query.length > 0 && (
              <Pressable onPress={() => { setQuery(""); setPredictions([]); }} hitSlop={8}>
                <X size={14} color={t.muted} />
              </Pressable>
            )}
          </View>

          {/* ヒント */}
          {predictions.length === 0 && query.length < 2 && (
            <View style={{ paddingHorizontal: SPACE.xl, paddingTop: SPACE.sm }}>
              <Text style={{ fontSize: fs.xs, color: t.muted, lineHeight: 18 }}>
                例: 越谷レイクタウン / ○○公園 / 市役所
              </Text>
            </View>
          )}

          {/* 検索結果 */}
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.placeId}
            keyboardDismissMode="on-drag"
            contentContainerStyle={{ paddingHorizontal: SPACE.lg, paddingBottom: 40 }}
            ListEmptyComponent={
              query.length >= 2 && !isSearching ? (
                <View style={{ alignItems: "center", paddingVertical: SPACE.xxxl }}>
                  <Text style={{ fontSize: fs.sm, color: t.muted }}>場所が見つかりません</Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelectPrediction(item)}
                accessibilityLabel={item.fullText}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: SPACE.md,
                  paddingVertical: SPACE.md,
                  borderBottomWidth: 1,
                  borderBottomColor: t.border,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.accent + "15", alignItems: "center", justifyContent: "center" }}>
                  <Navigation size={16} color={t.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: t.text }}>{item.mainText}</Text>
                  {item.secondaryText ? (
                    <Text style={{ fontSize: fs.xs, color: t.muted, marginTop: 1 }}>{item.secondaryText}</Text>
                  ) : null}
                </View>
              </Pressable>
            )}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
