import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert, Platform, KeyboardAvoidingView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { usePreventRemove } from "@react-navigation/native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, ImageIcon, MapPin, Locate, Check, Calendar, Clock } from "@/lib/icons";
import { CAT_CONFIG, type CategoryId } from "@/constants/categories";
import { createPostSchema, type CreatePostForm } from "@/lib/validations";
import { useCreatePost } from "@/hooks/usePosts";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useLocation } from "@/hooks/useLocation";
import { uploadImage } from "@/lib/storage";
import { getUserMessage } from "@/lib/appError";
import { useToastStore } from "@/stores/toastStore";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import PlacePickerModal from "@/components/ui/PlacePickerModal";
import type { SelectedPlace } from "@/components/ui/PlacePickerModal";
import AnimatedSubmitButton from "@/components/ui/AnimatedSubmitButton";

/** カテゴリ別の説明文 */
const CAT_HINTS: Record<CategoryId, string> = {
  lifeline: "物資・行政・防災など暮らしに関わる情報に\n例: 野菜入荷 / 防災訓練 / 手続きお知らせ",
  event: "地域のイベント・集まりの告知に\n例: お祭り / 体験会 / 集まり",
  help: "困りごとの相談・助け合いに\n例: 手伝ってほしい / 手伝えます",
};

/** カテゴリ別の締切ラベル */
const DEADLINE_LABELS: Record<CategoryId, string> = {
  lifeline: "情報の有効期限",
  event: "開催日時",
  help: "助けが必要な期限",
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

/** 新規投稿画面 */
export default function PostScreen() {
  const { s, t, fs, isDark } = useAppStyles();
  const createPostMutation = useCreatePost();
  const { images, isFull, pickImage, takePhoto, removeImage } = useImagePicker();
  const { lat, lng, granted, placeName } = useLocation();

  const { control, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { category: "lifeline", title: "", content: "", deadline: undefined },
    mode: "onChange",
  });

  const cat = watch("category");
  const title = watch("title");
  const deadline = watch("deadline");
  const [selectedChip, setSelectedChip] = useState<QuickChipId | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPlacePicker, setShowPlacePicker] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);

  const hasContent = (title?.trim().length ?? 0) > 0 || images.length > 0;

  // 破棄確認（submitted は state なので usePreventRemove が再評価される）
  usePreventRemove(hasContent && !submitted, ({ data }) => {
    Alert.alert(
      "投稿を破棄しますか？",
      "入力した内容は保存されません",
      [
        { text: "編集を続ける", style: "cancel" },
        {
          text: "破棄する",
          style: "destructive",
          onPress: () => {
            setSubmitted(true);
            setTimeout(() => router.back(), 50);
          },
        },
      ]
    );
  });

  const canSubmit = isValid && !createPostMutation.isPending;

  const onSubmit = async (data: CreatePostForm) => {
    if (createPostMutation.isPending) return;
    try {
      let image_url: string | undefined;
      let image_urls: string[] | undefined;
      if (images.length > 0) {
        image_urls = await Promise.all(images.map(uri => uploadImage("post-images", uri)));
        image_url = image_urls[0];
      }
      await createPostMutation.mutateAsync({
        category: data.category,
        title: data.title.trim(),
        content: data.content?.trim() || undefined,
        image_url,
        image_urls,
        deadline: data.deadline.toISOString(),
        location_text: selectedPlace ? `${selectedPlace.name}${selectedPlace.address ? " " + selectedPlace.address : ""}` : (placeName ?? undefined),
        lat: granted ? lat : undefined,
        lng: granted ? lng : undefined,
      });
      setSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => router.back(), 800);
    } catch (e: unknown) {
      if (__DEV__) console.error("投稿エラー詳細:", e);
      useToastStore.getState().show(getUserMessage(e), "error");
    }
  };

  /** 投稿成功画面 */
  if (submitted) {
    return (
      <View style={[s.screen, { flex: 1, justifyContent: "center", alignItems: "center" }]}>
        <View style={{ alignItems: "center", gap: SPACE.md }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: t.accent, alignItems: "center", justifyContent: "center" }}>
            <Check size={32} color="#000" />
          </View>
          <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text }}>近くの人へ届けました</Text>
        </View>
      </View>
    );
  }

  /** チップ選択ハンドラ */
  const handleChipPress = (id: QuickChipId) => {
    if (id === "custom") {
      setSelectedChip("custom");
      setShowPicker(true);
      return;
    }
    setSelectedChip(id);
    const date = chipToDate(id);
    if (date) setValue("deadline", date, { shouldValidate: true });
    setShowPicker(false);
  };

  /** DateTimePicker の変更ハンドラ */
  const handleDateChange = (_: any, selected?: Date) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (selected) {
      setValue("deadline", selected, { shouldValidate: true });
      setSelectedChip("custom");
    }
  };

  const renderGuideText = () => {
    if ((title?.trim().length ?? 0) === 0) {
      return (
        <Text style={{ fontSize: fs.sm, color: t.muted, textAlign: "center", marginTop: SPACE.xs }}>
          タイトルと期限を入力すると投稿できます
        </Text>
      );
    }
    if (!deadline) {
      return (
        <Text style={{ fontSize: fs.sm, color: t.muted, textAlign: "center", marginTop: SPACE.xs }}>
          期限を選ぶと投稿できます
        </Text>
      );
    }
    if (images.length === 0 && !granted) {
      return (
        <Text style={{ fontSize: fs.sm, color: t.muted, textAlign: "center", marginTop: SPACE.xs }}>
          写真や位置情報を添えるとさらに伝わります
        </Text>
      );
    }
    return null;
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}>
    <ScrollView style={s.screen} contentContainerStyle={{ padding: SPACE.xl, paddingBottom: 40, gap: SPACE.lg }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* イントロヘッダー */}
      <View style={{ marginBottom: SPACE.sm }}>
        <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text }}>近くの人に、今必要な情報を届ける</Text>
        <Text style={{ fontSize: fs.xs, color: t.sub, marginTop: SPACE.xs }}>今の情報が、近くの誰かの判断を助けます</Text>
      </View>

      {/* カテゴリ */}
      <View>
        <Text style={[s.textSectionLabel, { marginBottom: SPACE.sm }]}>カテゴリ <Text style={{ color: t.red }}>*</Text></Text>
        <View style={{ flexDirection: "row", gap: SPACE.sm }}>
          {(Object.entries(CAT_CONFIG) as [CategoryId, typeof CAT_CONFIG[CategoryId]][]).map(([id, c]) => {
            const Icon = c.icon;
            const active = cat === id;
            return (
              <Pressable key={id} onPress={() => setValue("category", id, { shouldValidate: true })} style={({ pressed }) => ({ flex: 1, alignItems: "center" as const, gap: 6, borderRadius: RADIUS.lg, paddingVertical: SPACE.md, paddingHorizontal: 6, borderWidth: active ? 2 : 1, borderColor: active ? c.color : t.border, backgroundColor: active ? c.color + "18" : t.surface, opacity: pressed ? 0.7 : 1 })}>
                <Icon size={20} color={active ? c.color : t.sub} />
                <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: active ? c.color : t.sub }}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={{ fontSize: fs.xxs, color: t.muted, marginTop: SPACE.sm }}>{CAT_HINTS[cat]}</Text>
      </View>

      {/* タイトル */}
      <View>
        <Text style={[s.textSectionLabel, { marginBottom: SPACE.xs }]}>タイトル <Text style={{ color: t.red }}>*</Text></Text>
        <Text style={{ fontSize: fs.xxs, color: t.muted, marginBottom: SPACE.sm }}>ひと目で内容が伝わる短い見出しにする</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={s.input} placeholder="例: 越谷駅前で野菜販売 / 今日16時から体操教室" placeholderTextColor={t.sub} value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        {errors.title && <Text style={{ fontSize: fs.xxs, color: t.red, marginTop: SPACE.xs }}>{errors.title.message}</Text>}
      </View>

      {/* 詳細 */}
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.sm }}>
          <Text style={s.textSectionLabel}>詳細</Text>
          <Text style={{ fontSize: fs.xxs, color: t.muted }}>任意</Text>
        </View>
        <Controller
          control={control}
          name="content"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[s.input, { height: 100, textAlignVertical: "top" }]} placeholder="例: 日時、場所、持ち物、対象者など" placeholderTextColor={t.sub} value={value ?? ""} onChangeText={onChange} onBlur={onBlur} multiline />
          )}
        />
        {errors.content && <Text style={{ fontSize: fs.xxs, color: t.red, marginTop: SPACE.xs }}>{errors.content.message}</Text>}
        <Text style={{ fontSize: fs.xxs, color: t.muted, marginTop: SPACE.xs }}>#ハッシュタグ を使うと検索で見つけてもらいやすくなります</Text>
      </View>

      {/* 期限 */}
      <View>
        <Text style={[s.textSectionLabel, { marginBottom: SPACE.xs }]}>{DEADLINE_LABELS[cat]} <Text style={{ color: t.red }}>*</Text></Text>
        <Text style={{ fontSize: fs.xxs, color: t.muted, marginBottom: SPACE.sm }}>最大2週間後まで設定できます</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACE.sm }}>
          {QUICK_CHIPS.map((chip) => {
            const active = selectedChip === chip.id;
            return (
              <Pressable
                key={chip.id}
                onPress={() => handleChipPress(chip.id)}
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
                {chip.id === "custom" ? <Calendar size={14} color={active ? t.accent : t.sub} /> : <Clock size={14} color={active ? t.accent : t.sub} />}
                <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: active ? t.accent : t.sub }}>{chip.label}</Text>
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
        {errors.deadline && <Text style={{ fontSize: fs.xxs, color: t.red, marginTop: SPACE.xs }}>{errors.deadline.message}</Text>}
        {showPicker && (
          <View style={{
            marginTop: SPACE.sm,
            borderRadius: RADIUS.lg,
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.border,
            overflow: "hidden",
          }}>
            <DateTimePicker
              value={deadline ?? new Date()}
              mode="datetime"
              display="spinner"
              minimumDate={new Date()}
              maximumDate={maxDeadline()}
              onChange={handleDateChange}
              locale="ja"
              themeVariant={isDark ? "dark" : "light"}
              textColor={t.text}
              accentColor={t.accent}
              style={{ backgroundColor: t.surface }}
            />
          </View>
        )}
      </View>

      {/* 写真 */}
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.sm }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
            <Text style={s.textSectionLabel}>写真を添えると伝わりやすくなります</Text>
            <Text style={{ fontSize: fs.xxs, color: t.muted }}>{images.length}/3</Text>
          </View>
          <Text style={{ fontSize: fs.xxs, color: t.muted }}>任意</Text>
        </View>
        <View style={{ flexDirection: "row", gap: SPACE.sm }}>
          <Pressable onPress={takePhoto} style={({ pressed }) => ({ width: 72, height: 72, borderRadius: RADIUS.lg, alignItems: "center" as const, justifyContent: "center" as const, gap: 5, borderWidth: 1.5, borderStyle: "dashed" as const, borderColor: t.border, backgroundColor: t.surface, opacity: isFull ? 0.3 : pressed ? 0.7 : 1 })}>
            <Camera size={22} color={t.sub} />
            <Text style={{ fontSize: fs.xs, color: t.sub }}>撮影</Text>
          </Pressable>
          <Pressable onPress={pickImage} style={({ pressed }) => ({ width: 72, height: 72, borderRadius: RADIUS.lg, alignItems: "center" as const, justifyContent: "center" as const, gap: 5, borderWidth: 1.5, borderStyle: "dashed" as const, borderColor: t.border, backgroundColor: t.surface, opacity: isFull ? 0.3 : pressed ? 0.7 : 1 })}>
            <ImageIcon size={22} color={t.sub} />
            <Text style={{ fontSize: fs.xs, color: t.sub }}>選択</Text>
          </Pressable>
        </View>
        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACE.sm, marginTop: SPACE.sm }}>
            {images.map((uri, i) => (
              <View key={uri} style={{ position: "relative" }}>
                <Image source={{ uri }} style={{ width: 120, height: 120, borderRadius: RADIUS.md }} />
                <Pressable onPress={() => removeImage(i)} style={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontSize: 12 }}>✕</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* 場所 */}
      {/* 場所（Lv1: 現在地 / Lv2: 場所検索） */}
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.sm }}>
          <Text style={s.textSectionLabel}>場所</Text>
          <Text style={{ fontSize: fs.xxs, color: t.muted }}>任意</Text>
        </View>

        {selectedPlace ? (
          /* 場所選択済み */
          <View style={[s.card, { flexDirection: "row" as const, alignItems: "center" as const, gap: SPACE.sm + 2 }]}>
            <MapPin size={18} color={t.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: t.text }}>{selectedPlace.name}</Text>
              {selectedPlace.address ? (
                <Text style={{ fontSize: fs.xs, color: t.sub, marginTop: 1 }}>{selectedPlace.address}</Text>
              ) : null}
            </View>
            <Pressable onPress={() => setSelectedPlace(null)} hitSlop={8}>
              <Text style={{ fontSize: fs.xs, color: t.muted }}>変更</Text>
            </Pressable>
          </View>
        ) : (
          /* 未選択: 2ボタン */
          <View style={{ gap: SPACE.sm }}>
            {/* Lv1: 現在地で投稿 */}
            <View style={[s.card, { flexDirection: "row" as const, alignItems: "center" as const, gap: SPACE.sm + 2 }]}>
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
              onPress={() => setShowPlacePicker(true)}
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

      <PlacePickerModal
        visible={showPlacePicker}
        onClose={() => setShowPlacePicker(false)}
        onSelect={(place) => { setSelectedPlace(place); setShowPlacePicker(false); }}
        t={t}
        currentLat={lat}
        currentLng={lng}
      />

      {/* エラーバナー */}
      {createPostMutation.error && (
        <View style={{ backgroundColor: "#FF4D4F20", padding: SPACE.md, borderRadius: RADIUS.md }}>
          <Text style={{ fontSize: fs.sm, color: "#FF4D4F" }}>
            {getUserMessage(createPostMutation.error)}
          </Text>
        </View>
      )}

      {/* 投稿ボタン */}
      <AnimatedSubmitButton
        onPress={handleSubmit(onSubmit)}
        disabled={!canSubmit}
        isPending={createPostMutation.isPending}
        canSubmit={canSubmit}
        t={t}
        fs={fs}
      />
      {renderGuideText()}
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
