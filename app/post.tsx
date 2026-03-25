import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, FadeIn } from "react-native-reanimated";
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { Camera, ImageIcon, MapPin, Locate, Check } from "@/lib/icons";
import { CAT_CONFIG, type CategoryId } from "@/constants/categories";
import { useCreatePost } from "@/hooks/usePosts";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useLocation } from "@/hooks/useLocation";
import { uploadImage } from "@/lib/storage";
import { getUserMessage } from "@/lib/appError";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";

/** カテゴリ別の説明文 */
const CAT_HINTS: Record<CategoryId, string> = {
  stock: "食料品、日用品など物資の共有に\n例: 野菜入荷 / パンの在庫 / おすそ分け",
  event: "地域のイベント・集まりの告知に\n例: お祭り / 体験会 / 集まり",
  help: "困りごとの相談・助け合いに\n例: 手伝ってほしい / 手伝えます",
  admin: "行政からのお知らせ・手続き情報に\n例: 手続き / お知らせ / 公的案内",
};

/** 新規投稿画面 */
export default function PostScreen() {
  const { s, t, fs } = useAppStyles();
  const createPostMutation = useCreatePost();
  const { imageUri, pickImage, takePhoto, clear } = useImagePicker();
  const { lat, lng, granted } = useLocation();

  const navigation = useNavigation();
  const submittedRef = useRef(false);

  const [cat, setCat] = useState<CategoryId>("stock");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const hasContent = title.trim().length > 0 || content.trim().length > 0 || imageUri !== null;

  useEffect(() => {
    if (!hasContent) return;

    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (submittedRef.current) return;
      e.preventDefault();
      Alert.alert(
        "投稿を破棄しますか？",
        "入力した内容は保存されません",
        [
          { text: "編集を続ける", style: "cancel" },
          { text: "破棄する", style: "destructive", onPress: () => navigation.dispatch(e.data.action) },
        ]
      );
    });

    return unsubscribe;
  }, [hasContent, navigation]);

  const canSubmit = title.trim().length > 0 && !createPostMutation.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      let image_url: string | undefined;
      if (imageUri) {
        image_url = await uploadImage("post-images", imageUri);
      }
      await createPostMutation.mutateAsync({
        category: cat,
        title: title.trim(),
        content: content.trim() || undefined,
        image_url,
        lat: granted ? lat : undefined,
        lng: granted ? lng : undefined,
      });
      setSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        submittedRef.current = true;
        router.back();
      }, 800);
    } catch (e: any) {
      Alert.alert("エラー", e.message ?? "投稿に失敗しました");
    }
  };

  /** 投稿成功画面 */
  if (submitted) {
    return (
      <View style={[s.screen, { flex: 1, justifyContent: "center", alignItems: "center" }]}>
        <Animated.View entering={FadeIn.duration(300)} style={{ alignItems: "center", gap: SPACE.md }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: t.accent, alignItems: "center", justifyContent: "center" }}>
            <Check size={32} color="#000" />
          </View>
          <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text }}>近くの人へ届けました</Text>
        </Animated.View>
      </View>
    );
  }

  /** 投稿ボタン下の補助テキスト */
  const renderGuideText = () => {
    if (title.trim().length === 0) {
      return (
        <Text style={{ fontSize: fs.sm, color: t.muted, textAlign: "center", marginTop: SPACE.xs }}>
          タイトルを入力すると投稿できます
        </Text>
      );
    }
    if (!imageUri && !granted) {
      return (
        <Text style={{ fontSize: fs.sm, color: t.muted, textAlign: "center", marginTop: SPACE.xs }}>
          写真や位置情報を添えるとさらに伝わります
        </Text>
      );
    }
    return null;
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: SPACE.xl, paddingBottom: 40, gap: SPACE.lg }} showsVerticalScrollIndicator={false}>
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
              <Pressable key={id} onPress={() => setCat(id)} style={({ pressed }) => ({ flex: 1, alignItems: "center" as const, gap: 6, borderRadius: RADIUS.lg, paddingVertical: SPACE.md, paddingHorizontal: 6, borderWidth: active ? 2 : 1, borderColor: active ? c.color : t.border, backgroundColor: active ? c.color + "18" : t.surface, opacity: pressed ? 0.7 : 1 })}>
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
        <TextInput style={s.input} placeholder="例: 越谷駅前で野菜販売 / 今日16時から体操教室" placeholderTextColor={t.sub} value={title} onChangeText={setTitle} />
      </View>

      {/* 詳細 */}
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.sm }}>
          <Text style={s.textSectionLabel}>詳細</Text>
          <Text style={{ fontSize: fs.xxs, color: t.muted }}>任意</Text>
        </View>
        <TextInput style={[s.input, { height: 100, textAlignVertical: "top" }]} placeholder="例: 日時、場所、持ち物、対象者など" placeholderTextColor={t.sub} value={content} onChangeText={setContent} multiline />
      </View>

      {/* 写真 */}
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.sm }}>
          <Text style={s.textSectionLabel}>写真を添えると伝わりやすくなります</Text>
          <Text style={{ fontSize: fs.xxs, color: t.muted }}>任意</Text>
        </View>
        <View style={{ flexDirection: "row", gap: SPACE.sm }}>
          <Pressable onPress={takePhoto} style={({ pressed }) => ({ width: 72, height: 72, borderRadius: RADIUS.lg, alignItems: "center" as const, justifyContent: "center" as const, gap: 5, borderWidth: 1.5, borderStyle: "dashed" as const, borderColor: t.border, backgroundColor: t.surface, opacity: pressed ? 0.7 : 1 })}>
            <Camera size={22} color={t.sub} />
            <Text style={{ fontSize: fs.xs, color: t.sub }}>撮影</Text>
          </Pressable>
          <Pressable onPress={pickImage} style={({ pressed }) => ({ width: 72, height: 72, borderRadius: RADIUS.lg, alignItems: "center" as const, justifyContent: "center" as const, gap: 5, borderWidth: 1.5, borderStyle: "dashed" as const, borderColor: t.border, backgroundColor: t.surface, opacity: pressed ? 0.7 : 1 })}>
            <ImageIcon size={22} color={t.sub} />
            <Text style={{ fontSize: fs.xs, color: t.sub }}>選択</Text>
          </Pressable>
        </View>
        {imageUri && (
          <View style={{ position: "relative" }}>
            <Image source={{ uri: imageUri }} style={{ width: "100%", height: 200, borderRadius: RADIUS.lg }} />
            <Pressable onPress={clear} style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontSize: 14 }}>✕</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* 場所 */}
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.sm }}>
          <Text style={s.textSectionLabel}>場所</Text>
          <Text style={{ fontSize: fs.xxs, color: t.muted }}>任意</Text>
        </View>
        <View style={[s.card, { flexDirection: "row" as const, alignItems: "center" as const, gap: SPACE.sm + 2 }]}>
          <MapPin size={18} color={granted ? t.accent : t.sub} />
          <Text style={{ flex: 1, fontSize: fs.base, color: granted ? t.text : t.sub }}>
            {granted ? "📍 位置情報つきで近くの人に届きやすくなります" : "位置なしでも投稿できます（許可すると届きやすい）"}
          </Text>
          <Locate size={16} color={granted ? t.accent : t.sub} />
        </View>
      </View>

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
        onPress={handleSubmit}
        disabled={!canSubmit}
        isPending={createPostMutation.isPending}
        canSubmit={canSubmit}
        t={t}
        fs={fs}
      />
      {renderGuideText()}
    </ScrollView>
  );
}

/** タップ感のあるアニメーション付き投稿ボタン */
function AnimatedSubmitButton({ onPress, disabled, isPending, canSubmit, t, fs }: {
  onPress: () => void;
  disabled: boolean;
  isPending: boolean;
  canSubmit: boolean;
  t: any;
  fs: any;
}) {
  const btnScale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) btnScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    btnScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <LinearGradient
          colors={canSubmit ? [t.accent, t.blue] : [t.surface2, t.surface2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: RADIUS.lg, padding: SPACE.lg, alignItems: "center" }}
        >
          {isPending ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={{ color: canSubmit ? "#000" : t.muted, fontWeight: WEIGHT.extrabold, fontSize: fs.lg + 1 }}>投稿する</Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
