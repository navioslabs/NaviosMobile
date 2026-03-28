import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeft,
  Camera,
  User,
  MapPin,
  Check,
} from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { updateProfileSchema, type UpdateProfileForm } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useAppStyles } from "@/hooks/useAppStyles";
import { useImagePicker } from "@/hooks/useImagePicker";
import { uploadImage } from "@/lib/storage";
import { getUserMessage } from "@/lib/appError";
import { Image } from "expo-image";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import { getScaledFontSize, WEIGHT, SPACE, RADIUS } from "@/lib/styles";

/** プロフィール編集画面 */
export default function ProfileEditScreen() {
  const { s, t, fs } = useAppStyles();
  const { profile } = useAuth();
  const updateMutation = useUpdateProfile();
  const { imageUri: avatarUri, pickImage: pickAvatar } = useImagePicker();

  const { control, handleSubmit, watch, formState: { errors, isValid } } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: profile?.display_name ?? "ゲストユーザー",
      bio: profile?.bio ?? "",
      locationText: profile?.location_text ?? "越谷市",
      isPublic: profile?.is_public ?? true,
      showLocation: profile?.show_location ?? true,
      showCheckins: profile?.show_checkins ?? false,
    },
    mode: "onChange",
  });

  const name = watch("displayName");
  const bio = watch("bio") ?? "";
  const isSaving = updateMutation.isPending;

  /** プロフィール保存 */
  const onSubmit = async (data: UpdateProfileForm) => {
    try {
      let avatar_url: string | undefined;
      if (avatarUri) {
        avatar_url = await uploadImage("avatars", avatarUri);
      }
      await updateMutation.mutateAsync({
        display_name: data.displayName.trim(),
        bio: data.bio?.trim() || undefined,
        location_text: data.locationText?.trim() || undefined,
        avatar_url,
        is_public: data.isPublic,
        show_location: data.showLocation,
        show_checkins: data.showCheckins,
      });
      router.back();
    } catch (e: unknown) {
      Alert.alert("エラー", getUserMessage(e));
    }
  };

  return (
    <View style={s.screen}>
      {/* ヘッダー */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACE.lg, paddingTop: 52, paddingBottom: SPACE.md, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.border }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}
        >
          <ChevronLeft size={24} color={t.text} />
        </Pressable>
        <Text style={s.textHeading}>プロフィール編集</Text>
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isSaving}
          style={({ pressed }) => ({
            paddingHorizontal: SPACE.lg,
            paddingVertical: SPACE.sm,
            borderRadius: RADIUS.full,
            backgroundColor: isValid && !isSaving ? t.accent : t.surface2,
            opacity: pressed && isValid ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: isValid && !isSaving ? "#000" : t.muted }}>
            {isSaving ? "保存中..." : "保存"}
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* アバター編集 */}
        <View style={{ alignItems: "center", paddingVertical: SPACE.xxl }}>
          <Pressable onPress={pickAvatar} style={{ position: "relative" }}>
            <LinearGradient
              colors={[t.accent, t.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", overflow: "hidden" }}
            >
              {avatarUri || profile?.avatar_url ? (
                <Image source={{ uri: avatarUri ?? profile?.avatar_url ?? "" }} style={{ width: 90, height: 90, borderRadius: 45 }} />
              ) : (
                <User size={40} color="#fff" />
              )}
            </LinearGradient>
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: t.accent,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: t.bg,
              }}
            >
              <Camera size={14} color="#000" />
            </View>
          </Pressable>
          <Text style={{ fontSize: fs.sm, color: t.accent, fontWeight: WEIGHT.semibold, marginTop: SPACE.md }}>写真を変更</Text>
        </View>

        {/* フォーム */}
        <View style={{ paddingHorizontal: SPACE.xl, gap: SPACE.xl }}>
          {/* 表示名 */}
          <View>
            <Text style={[s.textSectionLabel, { marginBottom: SPACE.sm }]}>表示名</Text>
            <Controller
              control={control}
              name="displayName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="表示名を入力"
                  placeholderTextColor={t.muted}
                  style={[s.input, { fontSize: fs.lg }]}
                  maxLength={20}
                />
              )}
            />
            {errors.displayName && <Text style={{ fontSize: fs.xxs, color: t.red, marginTop: SPACE.xs }}>{errors.displayName.message}</Text>}
            <Text style={{ fontSize: fs.xs, color: t.muted, marginTop: SPACE.xs, textAlign: "right" }}>
              {name.length}/20
            </Text>
          </View>

          {/* 自己紹介 */}
          <View>
            <Text style={[s.textSectionLabel, { marginBottom: SPACE.sm }]}>自己紹介</Text>
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="自己紹介を入力（任意）"
                  placeholderTextColor={t.muted}
                  style={[s.input, { height: 100, textAlignVertical: "top" }]}
                  multiline
                  maxLength={150}
                />
              )}
            />
            {errors.bio && <Text style={{ fontSize: fs.xxs, color: t.red, marginTop: SPACE.xs }}>{errors.bio.message}</Text>}
            <Text style={{ fontSize: fs.xs, color: bio.length > 140 ? t.red : t.muted, marginTop: SPACE.xs, textAlign: "right" }}>
              {bio.length}/150
            </Text>
          </View>

          {/* 地域 */}
          <View>
            <Text style={[s.textSectionLabel, { marginBottom: SPACE.sm }]}>地域</Text>
            <View style={[s.card, { flexDirection: "row", alignItems: "center", gap: SPACE.sm + 2 }]}>
              <MapPin size={18} color={t.accent} />
              <Controller
                control={control}
                name="locationText"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value ?? ""}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="地域を入力"
                    placeholderTextColor={t.muted}
                    style={{ flex: 1, fontSize: fs.lg, color: t.text }}
                  />
                )}
              />
            </View>
          </View>

          {/* 公開設定 */}
          <View>
            <Text style={[s.textSectionLabel, { marginBottom: SPACE.sm }]}>公開設定</Text>
            <View style={{ gap: SPACE.sm }}>
              {([
                { name: "isPublic" as const, label: "プロフィールを公開", desc: "他のユーザーからプロフィールが見えます" },
                { name: "showLocation" as const, label: "位置情報を表示", desc: "投稿に位置情報を表示します" },
                { name: "showCheckins" as const, label: "チェックイン履歴を公開", desc: "訪問履歴を他のユーザーに公開します" },
              ] as const).map((item) => (
                <Controller
                  key={item.name}
                  control={control}
                  name={item.name}
                  render={({ field: { onChange, value } }) => (
                    <PrivacyToggle
                      label={item.label}
                      desc={item.desc}
                      enabled={value}
                      onToggle={() => onChange(!value)}
                      t={t}
                    />
                  )}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/** プライバシー設定トグル行 */
function PrivacyToggle({ label, desc, enabled, onToggle, t }: {
  label: string;
  desc: string;
  enabled: boolean;
  onToggle: () => void;
  t: ThemeTokens;
}) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: SPACE.md,
        padding: SPACE.md,
        borderRadius: RADIUS.md,
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.border,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: t.text }}>{label}</Text>
        <Text style={{ fontSize: fs.xs, color: t.muted, marginTop: 2 }}>{desc}</Text>
      </View>
      <View style={{ width: 48, height: 28, borderRadius: 14, justifyContent: "center", backgroundColor: enabled ? t.accent : t.surface3 }}>
        <View style={{ position: "absolute", top: 2, width: 24, height: 24, borderRadius: 12, backgroundColor: enabled ? "#000" : "#fff", transform: [{ translateX: enabled ? 22 : 2 }], alignItems: "center", justifyContent: "center" }}>
          {enabled && <Check size={12} color={t.accent} />}
        </View>
      </View>
    </Pressable>
  );
}
