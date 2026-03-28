import { View, Text, ActivityIndicator, Pressable, Linking, Platform } from "react-native";
import { AlertCircle, Inbox, WifiOff, MapPinOff, RefreshCw, Lock } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

/** エラー種別 */
export type ErrorKind = "network" | "location" | "auth" | "permission" | "generic";

interface StateViewProps {
  t: ThemeTokens;
  type: "loading" | "empty" | "error";
  message?: string;
  onRetry?: () => void;
  /** エラー種別（エラー時のリカバリーガイド切り替え） */
  errorKind?: ErrorKind;
}

/** エラー種別ごとの表示設定 */
const ERROR_CONFIG: Record<ErrorKind, { icon: any; title: string; guide: string; action?: { label: string; handler: () => void } }> = {
  network: {
    icon: WifiOff,
    title: "ネットワークに接続できません",
    guide: "Wi-Fi またはモバイルデータの接続を確認してください",
    action: {
      label: "設定を開く",
      handler: () => {
        if (Platform.OS === "ios") Linking.openURL("App-Prefs:WIFI");
        else Linking.openSettings();
      },
    },
  },
  location: {
    icon: MapPinOff,
    title: "位置情報を取得できません",
    guide: "設定アプリから位置情報の許可をONにしてください",
    action: {
      label: "設定を開く",
      handler: () => Linking.openSettings(),
    },
  },
  auth: {
    icon: Lock,
    title: "セッションが切れました",
    guide: "再ログインしてください",
  },
  permission: {
    icon: Lock,
    title: "権限がありません",
    guide: "この操作を行う権限がありません。管理者にお問い合わせください",
  },
  generic: {
    icon: AlertCircle,
    title: "エラーが発生しました",
    guide: "しばらく時間をおいてから再試行してください",
  },
};

/** エラーメッセージからエラー種別を推定 */
export function detectErrorKind(error: unknown): ErrorKind {
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("ネットワーク")) return "network";
  if (msg.includes("location") || msg.includes("位置情報")) return "location";
  if (msg.includes("jwt") || msg.includes("token") || msg.includes("セッション") || msg.includes("ログイン")) return "auth";
  if (msg.includes("permission") || msg.includes("権限") || msg.includes("42501")) return "permission";
  return "generic";
}

/** 画面状態コンポーネント（ローディング・空・エラー） */
export default function StateView({ t, type, message, onRetry, errorKind }: StateViewProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);

  if (type === "loading") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: SPACE.xxxl }}>
        <ActivityIndicator size="large" color={t.accent} />
        <Text style={{ fontSize: fs.base, color: t.sub, marginTop: SPACE.lg }}>
          {message || "読み込み中..."}
        </Text>
      </View>
    );
  }

  if (type === "error") {
    const kind = errorKind ?? "generic";
    const config = ERROR_CONFIG[kind];
    const Icon = config.icon;

    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: SPACE.xxxl }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: t.red + "15", alignItems: "center", justifyContent: "center", marginBottom: SPACE.lg }}>
          <Icon size={32} color={t.red} />
        </View>
        <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text }}>
          {config.title}
        </Text>
        <Text style={{ fontSize: fs.md, color: t.sub, marginTop: SPACE.sm, textAlign: "center", lineHeight: 20 }}>
          {message || config.guide}
        </Text>

        <View style={{ flexDirection: "row", gap: SPACE.md, marginTop: SPACE.xl }}>
          {onRetry && (
            <Pressable
              onPress={onRetry}
              accessibilityLabel="再試行"
              accessibilityRole="button"
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: SPACE.xs,
                paddingHorizontal: SPACE.xl,
                paddingVertical: SPACE.sm + 2,
                borderRadius: RADIUS.lg,
                backgroundColor: t.accent,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <RefreshCw size={14} color="#000" />
              <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: "#000" }}>再試行</Text>
            </Pressable>
          )}
          {config.action && (
            <Pressable
              onPress={config.action.handler}
              accessibilityLabel={config.action.label}
              accessibilityRole="button"
              style={({ pressed }) => ({
                paddingHorizontal: SPACE.xl,
                paddingVertical: SPACE.sm + 2,
                borderRadius: RADIUS.lg,
                backgroundColor: t.surface2,
                borderWidth: 1,
                borderColor: t.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: t.text }}>{config.action.label}</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  // empty
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: SPACE.xxxl }}>
      <Inbox size={40} color={t.muted} />
      <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text, marginTop: SPACE.lg }}>
        まだ投稿がありません
      </Text>
      <Text style={{ fontSize: fs.md, color: t.sub, marginTop: SPACE.sm, textAlign: "center", lineHeight: 20 }}>
        {message || "近くの投稿が表示されます"}
      </Text>
    </View>
  );
}
