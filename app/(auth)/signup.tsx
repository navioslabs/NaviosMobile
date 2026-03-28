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

  /** フォームフィールドの共通レンダラー */
  const renderField = (
    name: keyof SignupForm,
    label: string,
    placeholder: string,
    options?: { secure?: boolean; keyboard?: "email-address" | "default"; maxLength?: number }
  ) => (
    <View style={{ gap: SPACE.xs }}>
      <Text style={s.textLabel}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[s.input, errors[name] && { borderColor: "#FF4D4F" }]}
            placeholder={placeholder}
            placeholderTextColor={t.muted}
            secureTextEntry={options?.secure}
            keyboardType={options?.keyboard ?? "default"}
            autoCapitalize={options?.keyboard === "email-address" ? "none" : "sentences"}
            maxLength={options?.maxLength}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {errors[name] && (
        <Text style={{ fontSize: fs.xs, color: "#FF4D4F" }}>{errors[name]?.message}</Text>
      )}
    </View>
  );

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
          <Text style={{ fontSize: fs.xxl, fontWeight: WEIGHT.extrabold, color: t.text }}>
            アカウント作成
          </Text>
          <Text style={[s.textMeta, { marginTop: SPACE.xs }]}>
            地域の情報をシェアしましょう
          </Text>
        </View>

        {/* サーバーエラー */}
        {serverError ? (
          <View style={{ backgroundColor: "#FF4D4F20", padding: SPACE.md, borderRadius: RADIUS.md }}>
            <Text style={{ fontSize: fs.sm, color: "#FF4D4F" }}>{serverError}</Text>
          </View>
        ) : null}

        {renderField("displayName", "表示名", "あなたの名前", { maxLength: 20 })}
        {renderField("email", "メールアドレス", "example@mail.com", { keyboard: "email-address" })}
        {renderField("password", "パスワード", "8文字以上", { secure: true })}
        {renderField("confirmPassword", "パスワード確認", "もう一度入力", { secure: true })}

        {/* 登録ボタン */}
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
