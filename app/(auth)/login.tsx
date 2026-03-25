import { useState } from "react";
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
import { loginSchema, type LoginForm } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";

/** ログイン画面 */
export default function LoginScreen() {
  const { s, t, fs } = useAppStyles();
  const { signIn } = useAuth();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError("");
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      router.replace("/(tabs)");
    } catch (e: any) {
      setServerError(
        e.message === "Invalid login credentials"
          ? "メールアドレスまたはパスワードが正しくありません"
          : "ログインに失敗しました。もう一度お試しください"
      );
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
        <View style={{ alignItems: "center", marginTop: SPACE.xxxl, marginBottom: SPACE.lg }}>
          <Text style={{ fontSize: fs.hero, fontWeight: WEIGHT.extrabold, color: t.accent, letterSpacing: -0.5 }}>
            navios
          </Text>
          <Text style={[s.textMeta, { marginTop: SPACE.sm }]}>
            地域情報を、みんなでシェア
          </Text>
        </View>

        {/* サーバーエラー */}
        {serverError ? (
          <View style={{ backgroundColor: "#FF4D4F20", padding: SPACE.md, borderRadius: RADIUS.md }}>
            <Text style={{ fontSize: fs.sm, color: "#FF4D4F" }}>{serverError}</Text>
          </View>
        ) : null}

        {/* メールアドレス */}
        <View style={{ gap: SPACE.xs }}>
          <Text style={s.textLabel}>メールアドレス</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[s.input, errors.email && { borderColor: "#FF4D4F" }]}
                placeholder="example@mail.com"
                placeholderTextColor={t.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.email && (
            <Text style={{ fontSize: fs.xs, color: "#FF4D4F" }}>{errors.email.message}</Text>
          )}
        </View>

        {/* パスワード */}
        <View style={{ gap: SPACE.xs }}>
          <Text style={s.textLabel}>パスワード</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[s.input, errors.password && { borderColor: "#FF4D4F" }]}
                placeholder="パスワードを入力"
                placeholderTextColor={t.muted}
                secureTextEntry
                autoComplete="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.password && (
            <Text style={{ fontSize: fs.xs, color: "#FF4D4F" }}>{errors.password.message}</Text>
          )}
        </View>

        {/* ログインボタン */}
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || loading}
          style={({ pressed }) => ({
            backgroundColor: isValid ? t.accent : t.surface3,
            padding: SPACE.md,
            borderRadius: RADIUS.md,
            alignItems: "center",
            opacity: pressed ? 0.8 : 1,
            marginTop: SPACE.sm,
          })}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: isValid ? "#000" : t.muted }}>
              ログイン
            </Text>
          )}
        </Pressable>

        {/* サインアップ導線 */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: SPACE.xs, marginTop: SPACE.md }}>
          <Text style={s.textMeta}>アカウントをお持ちでない方</Text>
          <Pressable onPress={() => router.push("/(auth)/signup")}>
            <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.accent }}>
              新規登録
            </Text>
          </Pressable>
        </View>

        {/* ゲスト導線 */}
        <Pressable
          onPress={() => router.replace("/(tabs)")}
          style={{ alignItems: "center", marginTop: SPACE.sm }}
        >
          <Text style={{ fontSize: fs.sm, color: t.muted }}>
            ログインせずに閲覧する
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
