import Constants from "expo-constants";

const DSN = Constants.expoConfig?.extra?.SENTRY_DSN ?? "";

let Sentry: any = null;

try {
  Sentry = require("@sentry/react-native");
} catch {
  // @sentry/react-native 未インストール時は無効化
}

/** Sentry 初期化（app/_layout.tsx で呼び出す） */
export function initSentry() {
  if (!Sentry || !DSN) {
    if (__DEV__) console.warn("Sentry は無効です（DSN未設定またはパッケージ未インストール）");
    return;
  }

  Sentry.init({
    dsn: DSN,
    debug: __DEV__,
    environment: __DEV__ ? "development" : "production",
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    enableAutoSessionTracking: true,
  });
}

/** エラーを Sentry に送信する */
export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!Sentry || !DSN) return;
  if (context) {
    Sentry.withScope((scope: any) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}
