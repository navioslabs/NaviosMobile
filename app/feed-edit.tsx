import React, { useState, useCallback } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert, Platform, KeyboardAvoidingView } from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Check } from "@/lib/icons";
import { editPostSchema, type EditPostForm } from "@/lib/validations";
import { usePost, useUpdatePost } from "@/hooks/usePosts";
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
import DeadlineSelector, { chipToDate, type QuickChipId } from "@/components/features/post/DeadlineSelector";
import PhotoUploader from "@/components/features/post/PhotoUploader";
import LocationPicker from "@/components/features/post/LocationPicker";
import { CAT_CONFIG } from "@/constants/categories";

/** 投稿編集画面 */
export default function EditPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t, fs, isDark } = useAppStyles();
  const { lat, lng, granted, placeName, isLoading: locLoading } = useLocation();
  const { data: post, isLoading: postLoading } = usePost(id!, lat, lng, !locLoading);
  const updateMutation = useUpdatePost();
  const { images, isFull, pickImage, takePhoto, removeImage } = useImagePicker();
  const toast = useToastStore((s) => s.show);

  const [submitted, setSubmitted] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedChip, setSelectedChip] = useState<QuickChipId | null>(null);
  const [showPlacePicker, setShowPlacePicker] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  /** 既存画像をクリアしたかどうか */
  const [clearedExistingImages, setClearedExistingImages] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<EditPostForm>({
    resolver: zodResolver(editPostSchema),
    values: post ? {
      title: post.title,
      content: post.content ?? "",
      deadline: post.deadline ? new Date(post.deadline) : new Date(),
    } : undefined,
    mode: "onChange",
  });

  const title = watch("title");
  const deadline = watch("deadline");

  /** 既存の画像URL（新規画像で置き換えない限り表示） */
  const existingImages = (!clearedExistingImages && images.length === 0)
    ? (post?.image_urls?.length ? post.image_urls : post?.image_url ? [post.image_url] : [])
    : [];

  const canSubmit = isValid && !updateMutation.isPending;

  /** 確認ダイアログを表示してから更新 */
  const onSubmit = (data: EditPostForm) => {
    if (updateMutation.isPending) return;
    Alert.alert(
      "この内容で更新しますか？",
      data.title.trim(),
      [
        { text: "キャンセル", style: "cancel" },
        { text: "更新する", onPress: () => executeUpdate(data) },
      ],
    );
  };

  /** 実際の更新処理 */
  const executeUpdate = async (data: EditPostForm) => {
    if (!post) return;
    try {
      let image_url: string | undefined;
      let image_urls: string[] | undefined;

      if (images.length > 0) {
        // 新規画像がある場合はアップロードして置き換え
        image_urls = await Promise.all(images.map(uri => uploadImage("post-images", uri)));
        image_url = image_urls[0];
      } else if (clearedExistingImages) {
        // 既存画像をクリアした場合
        image_url = "";
        image_urls = [];
      }
      // 画像変更なし → image_url/image_urls を送らない（既存維持）

      const input: Record<string, any> = {
        title: data.title.trim(),
        content: data.content?.trim() || null,
        deadline: data.deadline.toISOString(),
      };
      if (image_url !== undefined) input.image_url = image_url;
      if (image_urls !== undefined) input.image_urls = image_urls;
      if (selectedPlace) {
        input.location_text = `${selectedPlace.name}${selectedPlace.address ? " " + selectedPlace.address : ""}`;
      }

      await updateMutation.mutateAsync({ id: id!, input });
      setSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: unknown) {
      if (__DEV__) console.error("更新エラー:", e);
      toast(getUserMessage(e), "error");
    }
  };

  /** Android用: ネイティブ日時ダイアログを順に表示 */
  const openAndroidPicker = useCallback(() => {
    const now = deadline ?? new Date();
    DateTimePickerAndroid.open({
      value: now,
      mode: "date",
      minimumDate: new Date(),
      maximumDate: (() => { const d = new Date(); d.setDate(d.getDate() + 14); d.setHours(23, 59, 0, 0); return d; })(),
      onChange: (_, selectedDate) => {
        if (!selectedDate) return;
        DateTimePickerAndroid.open({
          value: selectedDate,
          mode: "time",
          is24Hour: true,
          onChange: (_, selectedTime) => {
            if (selectedTime) {
              setValue("deadline", selectedTime, { shouldValidate: true });
              setSelectedChip("custom");
            }
          },
        });
      },
    });
  }, [deadline, setValue]);

  const handleChipPress = (chipId: QuickChipId) => {
    if (chipId === "custom") {
      setSelectedChip("custom");
      if (Platform.OS === "android") {
        openAndroidPicker();
      } else {
        setShowPicker(true);
      }
      return;
    }
    setSelectedChip(chipId);
    const date = chipToDate(chipId);
    if (date) setValue("deadline", date, { shouldValidate: true });
    setShowPicker(false);
  };

  const handleDateChange = (_: any, selected?: Date) => {
    if (selected) {
      setValue("deadline", selected, { shouldValidate: true });
      setSelectedChip("custom");
    }
  };

  if (postLoading || !post) {
    return (
      <View style={[s.screen, { flex: 1, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: t.muted }}>読み込み中...</Text>
      </View>
    );
  }

  /** 更新成功画面 */
  if (submitted) {
    return (
      <View style={[s.screen, { flex: 1, justifyContent: "center", alignItems: "center", padding: SPACE.xl }]}>
        <View style={{ alignItems: "center", gap: SPACE.lg }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: t.accent, alignItems: "center", justifyContent: "center" }}>
            <Check size={36} color="#000" />
          </View>
          <Text style={{ fontSize: fs.xl, fontWeight: WEIGHT.extrabold, color: t.text }}>更新しました！</Text>
          <Text style={{ fontSize: fs.sm, color: t.sub, textAlign: "center" }}>投稿内容が更新されました</Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              marginTop: SPACE.lg,
              paddingVertical: SPACE.md,
              paddingHorizontal: SPACE.xxl,
              borderRadius: 12,
              backgroundColor: t.accent,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: "#000" }}>戻る</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const catConfig = CAT_CONFIG[post.category];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}>
    <ScrollView style={s.screen} contentContainerStyle={{ padding: SPACE.xl, paddingBottom: 40, gap: SPACE.lg }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* ヘッダー */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.sm }}>
        <Pressable onPress={() => router.back()} accessibilityLabel="戻る" accessibilityRole="button" style={({ pressed }) => [s.iconButton, { opacity: pressed ? 0.7 : 1 }]}>
          <ChevronLeft size={20} color={t.text} />
        </Pressable>
        <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text, flex: 1 }}>投稿を編集</Text>
        {/* カテゴリ表示（変更不可） */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: catConfig.color + "18" }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: catConfig.color }} />
          <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.extrabold, color: catConfig.color }}>{catConfig.label}</Text>
        </View>
      </View>

      {/* タイトル */}
      <View>
        <Text style={[s.textSectionLabel, { marginBottom: SPACE.xs }]}>タイトル <Text style={{ color: t.red }}>*</Text></Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={s.input} value={value} onChangeText={onChange} onBlur={onBlur} />
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
            <TextInput style={[s.input, { height: 100, textAlignVertical: "top" }]} value={value ?? ""} onChangeText={onChange} onBlur={onBlur} multiline />
          )}
        />
        {errors.content && <Text style={{ fontSize: fs.xxs, color: t.red, marginTop: SPACE.xs }}>{errors.content.message}</Text>}
      </View>

      {/* 期限 */}
      <DeadlineSelector
        category={post.category}
        deadline={deadline}
        selectedChip={selectedChip}
        showPicker={showPicker}
        onChipPress={handleChipPress}
        onDateChange={handleDateChange}
        error={errors.deadline?.message}
        t={t}
        fs={fs}
        isDark={isDark}
        sectionLabelStyle={s.textSectionLabel}
      />

      {/* 写真 */}
      {existingImages.length > 0 && images.length === 0 ? (
        <View>
          <Text style={[s.textSectionLabel, { marginBottom: SPACE.sm }]}>写真</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ gap: SPACE.sm }}>
            {existingImages.map((url, i) => (
              <View key={i} style={{ width: 80, height: 80, borderRadius: RADIUS.md, overflow: "hidden", marginRight: SPACE.sm, borderWidth: 1, borderColor: t.border }}>
                <View style={{ flex: 1, backgroundColor: t.surface2 }}>
                  {/* expo-image を直接使わず既存パターンに合わせる */}
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: fs.xxs, color: t.muted }}>画像{i + 1}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          <Pressable
            onPress={() => setClearedExistingImages(true)}
            style={{ marginTop: SPACE.sm }}
          >
            <Text style={{ fontSize: fs.xs, color: t.red }}>既存の写真を削除して変更する</Text>
          </Pressable>
        </View>
      ) : (
        <PhotoUploader
          images={images}
          isFull={isFull}
          onPickImage={pickImage}
          onTakePhoto={takePhoto}
          onRemoveImage={removeImage}
          t={t}
          fs={fs}
          sectionLabelStyle={s.textSectionLabel}
        />
      )}

      {/* 場所 */}
      <LocationPicker
        selectedPlace={selectedPlace}
        onClearPlace={() => setSelectedPlace(null)}
        onOpenPicker={() => setShowPlacePicker(true)}
        granted={granted}
        placeName={post.location_text ?? placeName}
        t={t}
        fs={fs}
        sectionLabelStyle={s.textSectionLabel}
        cardStyle={s.card}
      />

      <PlacePickerModal
        visible={showPlacePicker}
        onClose={() => setShowPlacePicker(false)}
        onSelect={(place) => { setSelectedPlace(place); setShowPlacePicker(false); }}
        t={t}
        currentLat={lat}
        currentLng={lng}
      />

      {/* エラーバナー */}
      {updateMutation.error && (
        <View style={{ backgroundColor: "#FF4D4F20", padding: SPACE.md, borderRadius: 8 }}>
          <Text style={{ fontSize: fs.sm, color: "#FF4D4F" }}>
            {getUserMessage(updateMutation.error)}
          </Text>
        </View>
      )}

      {/* 更新ボタン */}
      <AnimatedSubmitButton
        onPress={handleSubmit(onSubmit)}
        disabled={!canSubmit}
        isPending={updateMutation.isPending}
        canSubmit={canSubmit}
        t={t}
        fs={fs}
        label="更新する"
      />
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
