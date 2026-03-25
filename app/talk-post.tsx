import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { User, MapPin, Camera, ImageIcon, Send } from "@/lib/icons";
import { useCreateTalk } from "@/hooks/useTalks";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useLocation } from "@/hooks/useLocation";
import { uploadImage } from "@/lib/storage";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";

/** つぶやき投稿画面 */
export default function TalkPostScreen() {
  const { s, t, fs } = useAppStyles();
  const createTalkMutation = useCreateTalk();
  const { imageUri, pickImage, takePhoto, clear } = useImagePicker();
  const { lat, lng, granted } = useLocation();
  const [msg, setMsg] = useState("");

  const handleSend = async () => {
    if (!msg.trim()) return;
    try {
      let image_url: string | undefined;
      if (imageUri) {
        image_url = await uploadImage("talk-images", imageUri);
      }
      await createTalkMutation.mutateAsync({
        message: msg.trim(),
        image_url,
        lat: granted ? lat : undefined,
        lng: granted ? lng : undefined,
      });
      router.back();
    } catch (e: any) {
      Alert.alert("エラー", e.message ?? "投稿に失敗しました");
    }
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: SPACE.xl, paddingBottom: 40, gap: SPACE.lg }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: "row", gap: SPACE.md, alignItems: "flex-start" }}>
        <LinearGradient colors={[t.accent, t.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" }}>
          <User size={22} color="#fff" />
        </LinearGradient>
        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="この場所で何が起きてる？"
          placeholderTextColor={t.sub}
          multiline
          autoFocus
          style={{ flex: 1, fontSize: fs.xl, minHeight: 120, lineHeight: 26, color: t.text, textAlignVertical: "top" }}
        />
      </View>

      <View style={[s.card, { gap: SPACE.xs }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
          <MapPin size={16} color={granted ? t.accent : t.muted} />
          <Text style={{ fontSize: fs.md, fontWeight: WEIGHT.semibold, color: granted ? t.accent : t.muted }}>
            {granted ? "📍 現在地を取得済み" : "位置情報の許可が必要です"}
          </Text>
          <Text style={{ marginLeft: "auto", fontSize: fs.xs, color: t.muted }}>{granted ? "自動検出" : ""}</Text>
        </View>
        <Text style={{ fontSize: fs.xxs, color: t.muted, paddingLeft: SPACE.xxl }}>
          {granted ? "位置情報つきで投稿されます" : "設定から位置情報を許可してください"}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: SPACE.sm }}>
        <Pressable onPress={takePhoto} style={{ width: 60, height: 60, borderRadius: RADIUS.lg, alignItems: "center", justifyContent: "center", gap: SPACE.xs, borderWidth: 1.5, borderStyle: "dashed", borderColor: t.border, backgroundColor: t.surface }}>
          <Camera size={20} color={t.sub} />
          <Text style={{ fontSize: fs.xxs, color: t.sub }}>撮影</Text>
        </Pressable>
        <Pressable onPress={pickImage} style={{ width: 60, height: 60, borderRadius: RADIUS.lg, alignItems: "center", justifyContent: "center", gap: SPACE.xs, borderWidth: 1.5, borderStyle: "dashed", borderColor: t.border, backgroundColor: t.surface }}>
          <ImageIcon size={20} color={t.sub} />
          <Text style={{ fontSize: fs.xxs, color: t.sub }}>選択</Text>
        </Pressable>
      </View>
      {imageUri && (
        <View style={{ position: "relative" }}>
          <Image source={{ uri: imageUri }} style={{ width: "100%", height: 160, borderRadius: RADIUS.lg }} />
          <Pressable onPress={clear} style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontSize: 14 }}>✕</Text>
          </Pressable>
        </View>
      )}

      {/* 文字数超過警告 */}
      {msg.length > 140 && (
        <View style={{ backgroundColor: t.red + "15", borderRadius: RADIUS.md, padding: SPACE.md, borderWidth: 1, borderColor: t.red + "30" }}>
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.red }}>
            140文字を超えています（{msg.length - 140}文字オーバー）
          </Text>
        </View>
      )}

      <View style={s.rowBetween}>
        <Text style={{ fontSize: fs.sm, fontWeight: msg.length > 140 ? WEIGHT.bold : WEIGHT.normal, color: msg.length > 140 ? t.red : msg.length > 120 ? t.amber : t.muted }}>
          {msg.length}/140
        </Text>
        <Pressable
          onPress={handleSend}
          disabled={msg.length === 0 || msg.length > 140 || createTalkMutation.isPending}
        >
          <LinearGradient
            colors={msg.length > 0 && msg.length <= 140 ? [t.accent, t.blue] : [t.surface2, t.surface2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, borderRadius: RADIUS.lg, paddingHorizontal: SPACE.xxl + 4, paddingVertical: SPACE.md }}
          >
            <Send size={15} color={msg.length > 0 && msg.length <= 140 ? "#000" : t.muted} />
            <Text style={{ fontWeight: WEIGHT.extrabold, fontSize: fs.lg, color: msg.length > 0 && msg.length <= 140 ? "#000" : t.muted }}>投稿する</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </ScrollView>
  );
}
