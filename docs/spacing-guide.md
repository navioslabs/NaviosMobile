# スペーシング・余白ガイド

## 基本ルール

全画面で `lib/styles.ts` の `SPACE` 定数を使用する。マジックナンバーは禁止。

## スペーシングスケール

| 定数 | 値 | 用途 |
|------|-----|------|
| `SPACE.xs` | 4px | アイコンとテキストの間、ドット等 |
| `SPACE.sm` | 8px | チップ内パディング、小さいギャップ |
| `SPACE.md` | 12px | カード内パディング、セクション間 |
| `SPACE.lg` | 16px | 画面左右余白（標準）、カード内余白 |
| `SPACE.xl` | 20px | 画面左右余白（広め）、セクション間隔 |
| `SPACE.xxl` | 24px | 大セクション間隔 |
| `SPACE.xxxl` | 32px | 画面間余白、ヒーローセクション |

## 画面余白ルール

| 場所 | 値 | 定数 |
|------|-----|------|
| 画面左右パディング | 20px | `SPACE.xl` |
| リスト内パディング | 16px | `SPACE.lg` |
| カード内パディング | 16px | `SPACE.lg` |
| セクション間マージン | 8px | `SPACE.sm` |
| ScrollView下部余白 | 100px | 固定（タブバー+FAB考慮） |

## フォントサイズスケール

| 定数 | 値 | 用途 |
|------|-----|------|
| `FONT_SIZE.xxs` | 10px | バッジ内テキスト |
| `FONT_SIZE.xs` | 11px | キャプション |
| `FONT_SIZE.sm` | 12px | メタ情報 |
| `FONT_SIZE.md` | 13px | ラベル |
| `FONT_SIZE.base` | 14px | 本文 |
| `FONT_SIZE.lg` | 15px | 小見出し |
| `FONT_SIZE.xl` | 17px | 見出し |
| `FONT_SIZE.xxl` | 20px | セクションタイトル |
| `FONT_SIZE.xxxl` | 22px | 画面タイトル |
| `FONT_SIZE.hero` | 28px | ヒーロー |

## 角丸スケール

| 定数 | 値 | 用途 |
|------|-----|------|
| `RADIUS.sm` | 8px | 小さいタグ |
| `RADIUS.md` | 12px | 入力、カード角丸 |
| `RADIUS.lg` | 14px | 日付チップ、画像 |
| `RADIUS.xl` | 16px | カード |
| `RADIUS.xxl` | 18px | 大カード |
| `RADIUS.full` | 9999px | ピル、丸ボタン |
