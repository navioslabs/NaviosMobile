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
  const [showPassword, setShowPassword] = useState(false);

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
        <View style={{ alignItems: "center", marginTop: SPACE.xxxl, marginBottom: SPACE.lg }}>
          <Svg width={64} height={64} viewBox="0 0 640 640">
            <Rect x={0} y={0} width={640} height={640} rx={160} fill={t.accent} />
            <G transform="translate(320, 320)">
              <Polygon points="-120,-160 -60,-160 -60,160 -120,160" fill="rgba(255,255,255,0.85)" />
              <Polygon points="-60,-160 -120,-160 60,160 120,160" fill="rgba(255,255,255,0.6)" />
              <Polygon points="60,-160 120,-160 120,160 60,160" fill="rgba(255,255,255,0.85)" />
            </G>
          </Svg>
          <Text style={{ fontSize: fs.hero, fontWeight: WEIGHT.extrabold, color: t.text, letterSpacing: -0.8, marginTop: SPACE.md }}>
            navi<Text style={{ color: t.accent }}>os</Text>
          </Text>
          <Text style={[s.textMeta, { marginTop: SPACE.sm }]}>
            すぐそばの暮らしが、見えてくる。
          </Text>
        </View>

        {/* サーバーエラー */}
        {serverError ? (
          <View style={{ backgroundColor: t.red + "20", padding: SPACE.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: t.red + "40" }}>
            <Text style={{ fontSize: fs.sm, color: t.red }}>{serverError}</Text>
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
                  placeholder="パスワードを入力"
                  placeholderTextColor={t.muted}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  textContentType="password"
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
              {showPassword ? (
                <Eye size={18} color={t.muted} />
              ) : (
                <Lock size={18} color={t.muted} />
              )}
            </Pressable>
          </View>
          {errors.password && (
            <Text style={{ fontSize: fs.xs, color: t.red }}>{errors.password.message}</Text>
          )}
        </View>

        {/* ログインボタン */}
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
          style={({ pressed }) => ({
            alignItems: "center",
            marginTop: SPACE.md,
            paddingVertical: SPACE.md,
            borderRadius: RADIUS.lg,
            borderWidth: 1,
            borderColor: t.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.sub }}>
            ログインせずに閲覧する
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
