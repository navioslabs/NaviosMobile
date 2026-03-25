# Navios

**近くを知る。暮らしが変わる。**

Navios は、あなたの「今・ここ」に関係する地域情報だけを届けるモバイルアプリです。
近くのイベント、入荷情報、助け合い、行政のお知らせ——検索しなくても、開くだけで街が見えます。

---

## コンセプト

> 生活の判断を支援する OS

遠くのニュースは届くのに、隣で何が起きているか知らない。
Navios は「検索」を前提にしません。位置情報と AI が、必要な情報を自動で届けます。

---

## 主な機能

### Feed — 街のタイムライン

日付・カテゴリで地域の投稿を一覧。朝採れ野菜の入荷から給付金の締め切りまで、今日起きていることが時系列で流れてきます。

### Nearby — 半径で読む街

「すぐ近く（200m）」「徒歩圏内（500m）」「少し先」——距離で区切ると、街は驚くほど読みやすくなります。

### Talk — ご近所のリアルタイムな声

140 文字のひとこと投稿。「パン屋の残り少ない」「ヨガ会よかった」——今この瞬間の空気が流れてきます。

### Pulse — AI おすすめ

位置・時間・関心を読み取り、今行くべき場所・今知るべき情報を自動で並べます。検索バーに何を打つか迷う時間は終わりです。

### カテゴリ

| カテゴリ | 内容 | 色 |
|---------|------|-----|
| 物資 | 入荷・在庫・お裾分け | `#00D4A1` |
| イベント | 地域の催し・教室 | `#F5A623` |
| 近助 | 助け合い・ボランティア | `#F0425C` |
| 行政 | お知らせ・手続き | `#8B6FC0` |

---

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フレームワーク | Expo ~54 + React Native 0.83 |
| 言語 | TypeScript 5.9 |
| ルーティング | Expo Router（ファイルベース） |
| バックエンド | Supabase（Auth, Postgres, PostGIS, Storage） |
| データ取得 | React Query（`@tanstack/react-query`） |
| フォーム | React Hook Form + Zod |
| 状態管理 | Zustand（テーマ・フォントサイズ等の UI 状態のみ） |
| アニメーション | React Native Reanimated |
| ジェスチャー | React Native Gesture Handler |
| UI | StyleSheet（style prop 統一、NativeWind 不使用） |

---

## ディレクトリ構成

```
NaviosMobileRelease/
├── app/                  # 画面・ルーティング
│   ├── (tabs)/           #   タブ画面（ホーム, ちかく, ひとこと, さがす, 設定）
│   ├── feed/[id].tsx     #   投稿詳細
│   ├── talk-detail/[id]  #   ひとこと詳細
│   ├── profile/[id].tsx  #   プロフィール
│   ├── profile/edit.tsx  #   プロフィール編集
│   ├── post.tsx          #   投稿作成
│   └── talk-post.tsx     #   ひとこと投稿
├── components/
│   ├── ui/               #   プリミティブ（StateView, ReportModal 等）
│   ├── features/         #   機能別（feed, talk, nearby, ai, settings）
│   └── layout/           #   レイアウト（Header, Fab）
├── hooks/                # カスタム hooks
├── lib/                  # Supabase クエリ, ユーティリティ, エラー処理
├── stores/               # Zustand ストア（テーマ, フォントサイズ）
├── constants/            # デザイントークン, カテゴリ定義
├── types/                # 型定義
├── data/                 # モックデータ
├── supabase/             # DB マイグレーション
└── docs/                 # 設計書・仕様書
```

---

## 画面一覧

| 画面 | ルート | 概要 |
|------|--------|------|
| ホーム | `/(tabs)/` | 日付・カテゴリ・並び順で投稿一覧 |
| ちかく | `/(tabs)/nearby` | 距離区分で投稿表示 |
| ひとこと | `/(tabs)/talk` | 短文タイムライン |
| さがす | `/(tabs)/ai` | テキスト検索 + AI レコメンド |
| 設定 | `/(tabs)/settings` | テーマ・フォントサイズ・通知・アカウント |
| 投稿作成 | `/post` | カテゴリ選択 + タイトル + 詳細 + 写真 + 位置 |
| ひとこと投稿 | `/talk-post` | 140 文字 + 写真 + 自動位置情報 |
| 投稿詳細 | `/feed/[id]` | ヒーロー画像・期限・持ち物・通報 |
| ひとこと詳細 | `/talk-detail/[id]` | スレッド表示・返信 |
| プロフィール | `/profile/[id]` | ユーザー情報・バッジ・投稿一覧 |
| プロフィール編集 | `/profile/edit` | 表示名・自己紹介・地域・公開設定 |

---

## セットアップ

### 前提条件

- Node.js 18 以上
- npm または yarn
- Expo CLI
- Android Studio（Android 開発）/ Xcode（iOS 開発）

### インストール

```bash
npm install
```

### 環境変数

`.env` ファイルをプロジェクトルートに作成:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 起動

```bash
# 開発サーバー起動
npx expo start

# プラットフォーム別起動
npm run android
npm run ios
npm run web
```

---

## テーマ

Dark / Light 切替に対応。`useThemeStore` で管理し、デザイントークン経由で全コンポーネントに反映されます。フォントサイズは 3 段階（標準 / 大 / 特大）で調整可能。

---

## 設計ドキュメント

| ドキュメント | 場所 |
|-------------|------|
| データ設計（テーブル・RLS・Storage） | `docs/設計-仕様書/データ設計.md` |
| 認証設計（Auth・ゲスト制限） | `docs/設計-仕様書/認証設計.md` |
| API・lib 設計（クエリ関数・React Query） | `docs/設計-仕様書/API・lib設計.md` |
| 画面仕様書（全 11 画面） | `docs/設計-仕様書/画面仕様書.md` |
| バリデーション設計（Zod スキーマ） | `docs/設計-仕様書/バリデーション設計.md` |
| 機能概要 | `docs/機能概要.md` |

---

## ライセンス

Private — All rights reserved.

---

**NaviosLabs** — 足元の日本を、起動する。
