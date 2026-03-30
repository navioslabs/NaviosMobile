import { View, Text, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { Camera, ImageIcon } from "@/lib/icons";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import type { ThemeTokens } from "@/constants/theme";

interface Props {
  images: string[];
  isFull: boolean;
  onPickImage: () => void;
  onTakePhoto: () => void;
  onRemoveImage: (index: number) => void;
  t: ThemeTokens;
  fs: Record<string, number>;
  sectionLabelStyle: any;
}

/** 写真アップロードUI（画像プレビュー + 追加/削除ボタン） */
export default function PhotoUploader({ images, isFull, onPickImage, onTakePhoto, onRemoveImage, t, fs, sectionLabelStyle }: Props) {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.sm }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
          <Text style={sectionLabelStyle}>写真を添えると伝わりやすくなります</Text>
          <Text style={{ fontSize: fs.xxs, color: t.muted }}>{images.length}/3</Text>
        </View>
        <Text style={{ fontSize: fs.xxs, color: t.muted }}>任意</Text>
      </View>
      <View style={{ flexDirection: "row", gap: SPACE.sm }}>
        <Pressable
          onPress={onTakePhoto}
          style={({ pressed }) => ({
            width: 72,
            height: 72,
            borderRadius: RADIUS.lg,
            alignItems: "center" as const,
            justifyContent: "center" as const,
            gap: 5,
            borderWidth: 1.5,
            borderStyle: "dashed" as const,
            borderColor: t.border,
            backgroundColor: t.surface,
            opacity: isFull ? 0.3 : pressed ? 0.7 : 1,
          })}
        >
          <Camera size={22} color={t.sub} />
          <Text style={{ fontSize: fs.xs, color: t.sub }}>撮影</Text>
        </Pressable>
        <Pressable
          onPress={onPickImage}
          style={({ pressed }) => ({
            width: 72,
            height: 72,
            borderRadius: RADIUS.lg,
            alignItems: "center" as const,
            justifyContent: "center" as const,
            gap: 5,
            borderWidth: 1.5,
            borderStyle: "dashed" as const,
            borderColor: t.border,
            backgroundColor: t.surface,
            opacity: isFull ? 0.3 : pressed ? 0.7 : 1,
          })}
        >
          <ImageIcon size={22} color={t.sub} />
          <Text style={{ fontSize: fs.xs, color: t.sub }}>選択</Text>
        </Pressable>
      </View>
      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACE.sm, marginTop: SPACE.sm }}>
          {images.map((uri, i) => (
            <View key={uri} style={{ position: "relative" }}>
              <Image source={{ uri }} style={{ width: 120, height: 120, borderRadius: RADIUS.md }} />
              <Pressable
                onPress={() => onRemoveImage(i)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 12 }}>✕</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
