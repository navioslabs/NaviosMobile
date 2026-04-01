import React, { useState, useCallback, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert, Platform, KeyboardAvoidingView } from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { router, useNavigation } from "expo-router";
import { usePreventRemove } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "@/lib/icons";
import type { CategoryId } from "@/constants/categories";
import { createPostSchema, type CreatePostForm } from "@/lib/validations";
import { useCreatePost } from "@/hooks/usePosts";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useLocation } from "@/hooks/useLocation";
import { uploadImage } from "@/lib/storage";
import { getUserMessage } from "@/lib/appError";
import { useToastStore } from "@/stores/toastStore";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE } from "@/lib/styles";
import PlacePickerModal from "@/components/ui/PlacePickerModal";
import type { SelectedPlace } from "@/components/ui/PlacePickerModal";
import AnimatedSubmitButton from "@/components/ui/AnimatedSubmitButton";
import CategorySelector from "@/components/features/post/CategorySelector";
import DeadlineSelector, { chipToDate, type QuickChipId } from "@/components/features/post/DeadlineSelector";
import PhotoUploader from "@/components/features/post/PhotoUploader";
import LocationPicker from "@/components/features/post/LocationPicker";

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
            setTimeout(() => router.canGoBack() ? router.back() : router.replace("/(tabs)/feed"), 50);
          },
        },
      ]
    );
  });

  const canSubmit = isValid && !createPostMutation.isPending;

  /** 確認ダイアログを表示してから投稿を実行 */
  const onSubmit = (data: CreatePostForm) => {
    if (createPostMutation.isPending) return;
    Alert.alert(
      "この内容で投稿しますか？",
      `${data.title.trim()}`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "投稿する",
          onPress: () => executePost(data),
        },
      ],
    );
  };

  /** 実際の投稿処理 */
  const executePost = async (data: CreatePostForm) => {
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
    } catch (e: unknown) {
      if (__DEV__) console.error("投稿エラー詳細:", e);
      useToastStore.getState().show(getUserMessage(e), "error");
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

  /** 自動遷移（2秒後にホームへ） */
  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => router.replace("/(tabs)"), 2000);
    return () => clearTimeout(timer);
  }, [submitted]);

  /** 投稿成功画面 */
  if (submitted) {
    return (
      <View style={[s.screen, { flex: 1, justifyContent: "center", alignItems: "center", padding: SPACE.xl }]}>
        <View style={{ alignItems: "center", gap: SPACE.lg }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: t.accent, alignItems: "center", justifyContent: "center" }}>
            <Check size={36} color="#000" />
          </View>
          <Text style={{ fontSize: fs.xl, fontWeight: WEIGHT.extrabold, color: t.text }}>投稿しました！</Text>
          <Text style={{ fontSize: fs.sm, color: t.sub, textAlign: "center" }}>近くの人に届けられました</Text>
        </View>
      </View>
    );
  }

  /** チップ選択ハンドラ */
  const handleChipPress = (id: QuickChipId) => {
    if (id === "custom") {
      setSelectedChip("custom");
      if (Platform.OS === "android") {
        openAndroidPicker();
      } else {
        setShowPicker(true);
      }
      return;
    }
    setSelectedChip(id);
    const date = chipToDate(id);
    if (date) setValue("deadline", date, { shouldValidate: true });
    setShowPicker(false);
  };

  /** DateTimePicker の変更ハンドラ（iOS用） */
  const handleDateChange = (_: any, selected?: Date) => {
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
      <CategorySelector
        value={cat}
        onChange={(id) => setValue("category", id, { shouldValidate: true })}
        t={t}
        fs={fs}
        sectionLabelStyle={s.textSectionLabel}
      />

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
      <DeadlineSelector
        category={cat}
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

      {/* 場所 */}
      <LocationPicker
        selectedPlace={selectedPlace}
        onClearPlace={() => setSelectedPlace(null)}
        onOpenPicker={() => setShowPlacePicker(true)}
        granted={granted}
        placeName={placeName}
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
      {createPostMutation.error && (
        <View style={{ backgroundColor: "#FF4D4F20", padding: SPACE.md, borderRadius: 8 }}>
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
