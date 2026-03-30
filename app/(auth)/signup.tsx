import { useState } from "react";
import { getUserMessage } from "@/lib/appError";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Svg, { Rect, Polygon, G } from "react-native-svg";
import { Eye, Lock } from "@/lib/icons";
import { signupSchema, type SignupForm } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";

/** サインアップ画面 */
export default function SignupScreen() {
  const { s, t, fs } = useAppStyles();
  const { signUp } = useAuth();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { displayName: "", email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: SignupForm) => {
    setServerError("");
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.displayName);
      router.replace("/(tabs)");
    } catch (e: unknown) {
      setServerError(getUserMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: SPACE.xl, gap: SPACE.lg }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ヘッダー */}
        <View style={{ alignItems: "center", marginTop: SPACE.lg, marginBottom: SPACE.sm }}>
          <Svg width={48} height={48} viewBox="0 0 640 640">
            <Rect x={0} y={0} width={640} height={640} rx={160} fill={t.accent} />
            <G transform="translate(320, 320)">
              <Polygon points="-120,-160 -60,-160 -60,160 -120,160" fill="rgba(255,255,255,0.85)" />
              <Polygon points="-60,-160 -120,-160 60,160 120,160" fill="rgba(255,255,255,0.6)" />
              <Polygon points="60,-160 120,-160 120,160 60,160" fill="rgba(255,255,255,0.85)" />
            </G>
          </Svg>
          <Text style={{ fontSize: fs.xxl, fontWeight: WEIGHT.extrabold, color: t.text, marginTop: SPACE.md }}>
            アカウント作成
          </Text>
          <Text style={[s.textMeta, { marginTop: SPACE.xs }]}>
            地域の情報をシェアしましょう
          </Text>
        </View>

        {/* サーバーエラー */}
        {serverError ? (
          <View style={{ backgroundColor: t.red + "20", padding: SPACE.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: t.red + "40" }}>
            <Text style={{ fontSize: fs.sm, color: t.red }}>{serverError}</Text>
          </View>
        ) : null}

        {/* 表示名 */}
        <View style={{ gap: SPACE.xs }}>
          <Text style={s.textLabel}>表示名</Text>
          <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[s.input, errors.displayName && { borderColor: t.red }]}
                placeholder="あなたの名前"
                placeholderTextColor={t.muted}
                autoComplete="name"
                textContentType="name"
                maxLength={20}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.displayName && (
            <Text style={{ fontSize: fs.xs, color: t.red }}>{errors.displayName.message}</Text>
          )}
        </View>

        {/* メールアドレス */}
        <View style={{ gap: SPACE.xs }}>
          <Text style={s.textLabel}>メールアドレス</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[s.input, errors.email && { borderColor: t.red }]}
                placeholder="example@mail.com"
                placeholderTextColor={t.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.email && (
            <Text style={{ fontSize: fs.xs, color: t.red }}>{errors.email.message}</Text>
          )}
        </View>

        {/* パスワード */}
        <View style={{ gap: SPACE.xs }}>
          <Text style={s.textLabel}>パスワード</Text>
          <View style={{ position: "relative" }}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[s.input, errors.password && { borderColor: t.red }, { paddingRight: 48 }]}
                  placeholder="8文字以上"
                  placeholderTextColor={t.muted}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel={showPassword ? "パスワードを隠す" : "パスワードを表示"}
              accessibilityRole="button"
              style={{ position: "absolute", right: 12, top: 0, bottom: 0, justifyContent: "center" }}
            >
              {showPassword ? <Eye size={18} color={t.muted} /> : <Lock size={18} color={t.muted} />}
            </Pressable>
          </View>
          {errors.password && (
            <Text style={{ fontSize: fs.xs, color: t.red }}>{errors.password.message}</Text>
          )}
        </View>

        {/* パスワード確認 */}
        <View style={{ gap: SPACE.xs }}>
          <Text style={s.textLabel}>パスワード確認</Text>
          <View style={{ position: "relative" }}>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[s.input, errors.confirmPassword && { borderColor: t.red }, { paddingRight: 48 }]}
                  placeholder="もう一度入力"
                  placeholderTextColor={t.muted}
                  secureTextEntry={!showConfirm}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <Pressable
              onPress={() => setShowConfirm(!showConfirm)}
              accessibilityLabel={showConfirm ? "パスワードを隠す" : "パスワードを表示"}
              accessibilityRole="button"
              style={{ position: "absolute", right: 12, top: 0, bottom: 0, justifyContent: "center" }}
            >
              {showConfirm ? <Eye size={18} color={t.muted} /> : <Lock size={18} color={t.muted} />}
            </Pressable>
          </View>
          {errors.confirmPassword && (
            <Text style={{ fontSize: fs.xs, color: t.red }}>{errors.confirmPassword.message}</Text>
          )}
        </View>

        {/* 登録ボタン */}
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || loading}
          style={({ pressed }) => ({
            backgroundColor: isValid ? t.accent : t.surface3,
            padding: SPACE.md,
            borderRadius: RADIUS.lg,
            alignItems: "center",
            opacity: pressed ? 0.8 : 1,
            marginTop: SPACE.sm,
          })}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: isValid ? "#000" : t.muted }}>
              アカウントを作成
            </Text>
          )}
        </Pressable>

        {/* ログイン導線 */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: SPACE.xs, marginTop: SPACE.md }}>
          <Text style={s.textMeta}>既にアカウントをお持ちの方</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.accent }}>
              ログイン
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
