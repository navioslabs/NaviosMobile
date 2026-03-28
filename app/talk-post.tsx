import React, { useEffect, useRef, useCallback } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { usePreventRemove } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, MapPin, Camera, ImageIcon, Send } from "@/lib/icons";
import { createTalkSchema, type CreateTalkForm } from "@/lib/validations";
import { useCreateTalk } from "@/hooks/useTalks";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useLocation } from "@/hooks/useLocation";
import { uploadImage } from "@/lib/storage";
import { getUserMessage } from "@/lib/appError";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";

const MAX_LENGTH = 140;

/** ローテーション用プレースホルダー例 */
const PLACEHOLDER_EXAMPLES = [
  "例: パン残り少なめです",
  "例: 公園に人多めです",
  "例: 道路工事で渋滞してます",
  "例: カフェ空いてて快適です",
  "例: 桜がきれいに咲いてます",
];

/** つぶやき投稿画面 */
export default function TalkPostScreen() {
  const { s, t, fs } = useAppStyles();
  const createTalkMutation = useCreateTalk();
  const { images, isFull, pickImage, takePhoto, removeImage } = useImagePicker();
  const { lat, lng, granted } = useLocation();
  const submittedRef = useRef(false);
  const [placeholderIndex, setPlaceholderIndex] = React.useState(0);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<CreateTalkForm>({
    resolver: zodResolver(createTalkSchema),
    defaultValues: { message: "" },
    mode: "onChange",
  });

  const msg = watch("message");
  const remaining = MAX_LENGTH - (msg?.length ?? 0);
  const isValid = (msg?.trim().length ?? 0) > 0 && remaining >= 0;
  const isPending = createTalkMutation.isPending;

  const hasContent = (msg?.trim().length ?? 0) > 0 || images.length > 0;

  // プレースホルダーのローテーション
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // 破棄確認
  usePreventRemove(hasContent && !submittedRef.current, ({ data }) => {
    Alert.alert(
      "投稿を破棄しますか？",
      "入力した内容は保存されません",
      [
        { text: "編集を続ける", style: "cancel" },
        { text: "破棄する", style: "destructive", onPress: () => router.back() },
      ]
    );
  });

  const onSubmit = useCallback(async (data: CreateTalkForm) => {
    if (isPending) return;
    try {
      let image_url: string | undefined;
      let image_urls: string[] | undefined;
      if (images.length > 0) {
        image_urls = await Promise.all(images.map(uri => uploadImage("talk-images", uri)));
        image_url = image_urls[0];
      }
      await createTalkMutation.mutateAsync({
        message: data.message.trim(),
        image_url,
        image_urls,
        lat: granted ? lat : undefined,
        lng: granted ? lng : undefined,
      });
      submittedRef.current = true;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.back();
    } catch (e: unknown) {
      Alert.alert("エラー", getUserMessage(e));
    }
  }, [isPending, images, granted, lat, lng, createTalkMutation]);

  /** 文字数カウントの色を決定 */
  const countColor = remaining < 0 ? t.red : remaining <= 20 ? t.amber : t.muted;

  /** 文字数表示テキスト */
  const countText = remaining >= 0 ? `あと ${remaining}文字` : `${Math.abs(remaining)}文字オーバー`;

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: SPACE.xl, paddingBottom: 40, gap: SPACE.lg }} showsVerticalScrollIndicator={false}>
      {/* イントロテキスト */}
      <Text style={{ fontSize: fs.sm, color: t.sub }}>
        短くて大丈夫。今の様子をそのまま届けよう
      </Text>

      {/* アバター + テキスト入力 */}
      <View style={{ flexDirection: "row", gap: SPACE.md, alignItems: "flex-start" }}>
        <LinearGradient colors={[t.accent, t.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" }}>
          <User size={22} color="#fff" />
        </LinearGradient>
        <Controller
          control={control}
          name="message"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
              placeholderTextColor={t.sub}
              multiline
              autoFocus
              style={{ flex: 1, fontSize: fs.xl, minHeight: 120, lineHeight: 26, color: t.text, textAlignVertical: "top" }}
            />
          )}
        />
      </View>
      {errors.message && <Text style={{ fontSize: fs.xxs, color: t.red }}>{errors.message.message}</Text>}

      {/* コンパクト位置情報（インライン1行） */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
        <MapPin size={14} color={granted ? t.accent : t.muted} />
        <Text style={{ fontSize: fs.sm, color: granted ? t.accent : t.muted }}>
          {granted ? "📍 近くの人に届きやすくなります" : "位置なしでも投稿できます"}
        </Text>
      </View>

      {/* 写真セクション */}
      <View style={{ gap: SPACE.xs }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
          <Text style={{ fontSize: fs.xs, color: t.sub }}>
            様子が伝わりやすくなります
          </Text>
          <Text style={{ fontSize: fs.xxs, color: t.muted }}>{images.length}/3</Text>
        </View>
        <View style={{ flexDirection: "row", gap: SPACE.sm }}>
          <Pressable onPress={takePhoto} style={{ width: 60, height: 60, borderRadius: RADIUS.lg, alignItems: "center", justifyContent: "center", gap: SPACE.xs, borderWidth: 1.5, borderStyle: "dashed", borderColor: t.border, backgroundColor: t.surface, opacity: isFull ? 0.3 : 1 }}>
            <Camera size={20} color={t.sub} />
            <Text style={{ fontSize: fs.xxs, color: t.sub }}>撮影</Text>
          </Pressable>
          <Pressable onPress={pickImage} style={{ width: 60, height: 60, borderRadius: RADIUS.lg, alignItems: "center", justifyContent: "center", gap: SPACE.xs, borderWidth: 1.5, borderStyle: "dashed", borderColor: t.border, backgroundColor: t.surface, opacity: isFull ? 0.3 : 1 }}>
            <ImageIcon size={20} color={t.sub} />
            <Text style={{ fontSize: fs.xxs, color: t.sub }}>選択</Text>
          </Pressable>
        </View>
      </View>
      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACE.sm }}>
          {images.map((uri, i) => (
            <View key={uri} style={{ position: "relative" }}>
              <Image source={{ uri }} style={{ width: 100, height: 100, borderRadius: RADIUS.md }} />
              <Pressable onPress={() => removeImage(i)} style={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 12 }}>✕</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      {/* 文字数超過警告バナー */}
      {remaining < 0 && (
        <View style={{ backgroundColor: t.red + "15", borderRadius: RADIUS.md, padding: SPACE.md, borderWidth: 1, borderColor: t.red + "30" }}>
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.red }}>
            140文字を超えています（{Math.abs(remaining)}文字オーバー）
          </Text>
        </View>
      )}

      {/* 文字数カウント + 送信ボタン */}
      <View style={s.rowBetween}>
        <Text style={{ fontSize: fs.sm, fontWeight: remaining < 0 ? WEIGHT.bold : WEIGHT.normal, color: countColor }}>
          {countText}
        </Text>
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isPending}
        >
          <LinearGradient
            colors={[t.accent, t.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              borderRadius: RADIUS.lg,
              paddingHorizontal: SPACE.xxl + 4,
              paddingVertical: SPACE.md,
              opacity: isValid && !isPending ? 1 : 0.3,
            }}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Send size={15} color={isValid ? "#000" : t.muted} />
            )}
            <Text style={{ fontWeight: WEIGHT.extrabold, fontSize: fs.lg, color: isValid ? "#000" : t.muted }}>
              {isPending ? "投稿中..." : "投稿する"}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </ScrollView>
  );
}
