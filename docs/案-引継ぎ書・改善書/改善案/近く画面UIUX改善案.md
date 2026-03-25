# Navios ちかく画面 UI/UX 改善案

> 対象画面: `app/(tabs)/index.tsx`（NearByScreen）
> 関連: `hooks/useLocation.ts`, `hooks/usePosts.ts`, `lib/posts.ts`, `supabase/migrations/20260325000001_rpc_nearby.sql`
> 更新日: 2026-03-25
> 位置づけ: NaviOs のホーム画面 = アプリの顔。距離ベースのリアルタイム体験を実現するための設計提案書

---

## 1. 結論

**ちかく画面は NaviOs の顔であり、このアプリの独自価値そのものである。**

NaviOs の核心は「今いる場所に一番近い情報が、一番上に来る」こと。
現状は「画面を開いたときの1回の位置取得」でリストを作っているが、ユーザーが歩いて移動すれば距離は変わる。**距離が変わったらカードの順序も自動で変わるべき**。

これを実現するには以下の3つが必要になる。

1. **位置情報の継続監視** — 移動したら検知する
2. **距離変動に応じた自動再取得** — 近づいたらリストを更新する
3. **順序変動の可視化** — カードが入れ替わったことをユーザーに伝える

---

## 2. 現状の良い点

- 距離ベースの3セクション構成（200m / 500m / それ以上）が直感的
- `SectionList` で距離順ソート済み
- `ScanHeader` の LIVE / HOT バッジでリアルタイム感を演出
- `FeaturedGlow` で最も近い投稿を視覚的に強調
- `MatchBadge` で距離スコアを数値化
- PostGIS の `get_nearby_posts` RPC で距離計算をサーバー側に委譲
- Pull-to-refresh で手動リフレッシュ可能
- FadeInUp スタッガーアニメーション実装済み

## 3. 現状の課題

### 3.1 位置情報が「1回きり」

> **実装確認**: `useLocation` は `useEffect([], ...)` でマウント時に1回だけ `getCurrentPositionAsync` を呼ぶ。その後はユーザーが pull-to-refresh するか、ロゴを押すまで位置は更新されない。

ユーザーが200m歩いても、リストは古い距離のまま。「ちかく」と言いながら、今の位置を反映していない。

### 3.2 「自動で近づいてきた」体験がない

Navios の独自価値は「歩いていたら、近くの投稿が自然に上がってくる」こと。
現状はこれがない。手動リフレッシュに頼っている。

### 3.3 ScanHeader の数値がハードコード

> **実装確認**: `盛り上がり度 82 / 100` が固定値。投稿数や距離から動的に算出すべき。

### 3.4 セクション境界が固定

200m / 500m の閾値は固定。郊外では200m以内に投稿がほぼなく、都市部では200m以内に大量に集中する可能性がある。

### 3.5 keyExtractor が不安定

> **実装確認**: `keyExtractor={(item, index) => \`${item.title}-${index}\`}` — タイトルは重複する可能性がある。距離変動でリストが再ソートされたとき、React が同じ key を別アイテムと誤認する可能性がある。`item.id` を使うべき。

---

## 4. コアコンセプト: 「歩くとリストが変わる」

### 4.1 ユーザーのメンタルモデル

```
ユーザーが歩く
  ↓
距離が変わる
  ↓
近づいた投稿が上に上がってくる
  ↓
「あ、もうすぐそこだ」と気づく
  ↓
行動する（立ち寄る、参加する、買いに行く）
```

これが Navios の UX の核心。この体験を「自動で」「バッテリーを殺さず」「通信を無駄にせず」実現する。

### 4.2 設計原則

| 原則 | 理由 |
|------|------|
| **距離が近い = 一番上** | 例外なし。Featured も距離最小のものが選ばれる |
| **移動したら更新する** | ただし数メートルの微動では更新しない |
| **バッテリーを殺さない** | バックグラウンド監視はしない。フォアグラウンドのみ |
| **通信を無駄にしない** | 閾値を超えた移動があったときだけサーバーに再問い合わせ |
| **変化を見せる** | カードが入れ替わったら、ユーザーに気づかせる |

---

## 5. 位置情報の継続監視設計

### 5.1 基本方針

`expo-location` の `watchPositionAsync` を使い、フォアグラウンドで位置を継続監視する。

### 5.2 パラメータ設計

| パラメータ | 値 | 理由 |
|-----------|-----|------|
| `accuracy` | `Location.Accuracy.Balanced` | GPS精度と電力消費のバランス。High は不要 |
| `distanceInterval` | `50` (m) | 50m以上移動したときだけコールバックを発火。細かすぎると無駄な更新が増える |
| `timeInterval` | `15000` (15秒) | 最低15秒間隔。立ち止まっていても連打しない |

### 5.3 再取得のトリガー条件

位置が更新されるたびにサーバーに問い合わせるのは無駄。以下の条件を満たしたときだけ `invalidateQueries` する。

```
前回の問い合わせ座標からの移動距離 >= 100m
```

100m の理由:
- 200m セクションの半分。セクション境界をまたぐ頃には必ず1回は更新される
- 50m だと頻繁すぎる。200m だとセクション変化に気づけない
- 100m は徒歩で約1.2分。体感として「少し歩いた」タイミング

### 5.4 useLocation の拡張案

```typescript
// 現在: 1回取得
const { lat, lng } = useLocation();

// 拡張後: 継続監視
const { lat, lng, isWatching } = useLocation({ watch: true, distanceInterval: 50 });
```

`useLocation` に `watch` オプションを追加し、`watchPositionAsync` を使う。
画面がアンマウントされたら `subscription.remove()` でクリーンアップする。

> **実装メモ**: `useLocation` の `watch` モードは、ちかく画面でのみ有効にする。他の画面では従来の1回取得で十分。`useEffect` のクリーンアップで `subscription.remove()` を呼べば、タブ切替時に自動停止する。

### 5.5 バッテリー対策

- **フォアグラウンドのみ** — バックグラウンド監視は行わない
- **タブ非アクティブ時は停止** — `useIsFocused()` でタブのフォーカス状態を監視し、非アクティブ時は `subscription.remove()`
- **`distanceInterval: 50`** — 微動では発火しない
- **`timeInterval: 15000`** — 最低15秒間隔
- **100m 閾値** — 実際のサーバー問い合わせはさらに間引かれる

---

## 6. 距離変動に応じた自動再取得設計

### 6.1 React Query との連携

```typescript
// hooks/usePosts.ts の useNearbyPosts を拡張
export function useNearbyPosts(lat: number, lng: number, radius?: number) {
  return useQuery({
    queryKey: ["posts", "nearby", { lat, lng, radius }],
    queryFn: () => fetchNearbyPosts(lat, lng, radius),
    enabled: lat !== 0 && lng !== 0,
    staleTime: 1000 * 30,        // 30秒間はキャッシュを使う
    refetchInterval: 1000 * 60,   // 60秒ごとに静かに再取得（立ち止まっていても鮮度を保つ）
  });
}
```

`lat, lng` が変わると `queryKey` が変わり、自動で再取得される。
ただし `lat, lng` は浮動小数点なので微小変化でも key が変わってしまう。

**対策**: queryKey に座標を含めず、100m 閾値で手動 invalidate する方式を推奨。

### 6.2 100m 閾値の実装

```typescript
// index.tsx 内で
const lastQueryRef = useRef({ lat: 0, lng: 0 });

const shouldRefetch = useMemo(() => {
  const d = haversineDistance(lat, lng, lastQueryRef.current.lat, lastQueryRef.current.lng);
  return d >= 100;
}, [lat, lng]);

useEffect(() => {
  if (shouldRefetch) {
    lastQueryRef.current = { lat, lng };
    qc.invalidateQueries({ queryKey: ["posts", "nearby"] });
  }
}, [shouldRefetch]);
```

### 6.3 Haversine 距離計算（クライアント側）

サーバーに問い合わせる前に「100m 移動したか」を判定するための軽量な距離計算。

```typescript
/** 2点間の距離（メートル） */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

> **配置**: `lib/utils.ts` に追加。

---

## 7. 順序変動の可視化

### 7.1 カードが入れ替わったことを伝える

距離が変わってリストの順序が変わったとき、何の説明もなくカードが入れ替わると混乱する。

提案:

- **Layout アニメーション** — `Animated.View` に `layout={LinearTransition}` を付け、カードの位置変化を滑らかにアニメーションさせる
- **「近づいています」バッジ** — 前回より距離が縮まった投稿に小さなインジケータを付ける
- **Featured の自動切替** — 最も近い投稿が変わったとき、Featured カードが自然に切り替わる

### 7.2 ScanHeader の動的化

現在ハードコードされている `盛り上がり度 82 / 100` を動的に算出する。

算出ロジック案:

```typescript
// 投稿数ベースの簡易 Pulse スコア
const pulseScore = Math.min(100, Math.round(
  (nearbyPosts.length / 20) * 40 +           // 投稿数（最大40pt）
  (closeCount / Math.max(nearbyPosts.length, 1)) * 30 + // 近接率（最大30pt）
  (recentCount / Math.max(nearbyPosts.length, 1)) * 30   // 新着率（最大30pt）
));
```

- `nearbyPosts.length / 20 * 40` — 20件で上限。投稿が多いほど盛り上がっている
- `closeCount` — 200m以内の件数。近い投稿が多いほどスコアが高い
- `recentCount` — 直近1時間以内の投稿数。新しいほど活発

### 7.3 更新時刻の動的化

> **実装確認**: 現在の `timeStr` はレンダー時の `new Date()` を使っている。位置更新のたびに ScanHeader が再レンダーされるので、更新時刻は自然に変わる。ただし「最後にサーバーからデータを取得した時刻」を表示する方がより正確。

提案: `useNearbyPosts` の `dataUpdatedAt` を ScanHeader に渡す。

---

## 8. UI 改善案

### 8.1 keyExtractor の修正

```typescript
// 現在（不安定）
keyExtractor={(item, index) => `${item.title}-${index}`}

// 修正後
keyExtractor={(item) => item.id}
```

> **重要度: 最高**。距離変動でリストが再ソートされたとき、key が不安定だと React がアイテムを正しく識別できず、描画が壊れる。

### 8.2 「すぐ近く」セクションの空状態改善

現在は `200m以内にイベントはありません / 少し足を伸ばしてみましょう` と表示。

提案:
- `歩いているうちに近い投稿が見つかるかもしれません` に変更
- 「ちかく画面は歩くと変わる」ことを示唆する文言にする

### 8.3 位置情報未許可時の体験

現在はローディングとフォールバック座標で対応しているが、位置情報が許可されていないと「ちかく」機能の価値が伝わらない。

提案:
- 位置情報未許可時に専用の StateView を表示
- `位置情報を許可すると、今いる場所に近い情報が表示されます` + 許可ボタン

### 8.4 距離表示のリアルタイム感

カードの距離表示（`120m`、`徒歩2分`）が最後のクエリ時点のものであることを示す、あるいは逆に「今の距離」として信頼できることを示す。

提案:
- ScanHeader の更新時刻が「いつの距離か」を暗黙的に伝える
- 距離が縮まった投稿には `↓ 近づいています` のような小さなラベルを出す（オプション）

---

## 9. 優先度

### Phase 1: 基盤（これがないと始まらない）

| # | 内容 | コスト | 効果 |
|---|------|--------|------|
| 1 | `keyExtractor` を `item.id` に修正 | 1行 | バグ予防、必須 |
| 2 | `useLocation` に `watch` モード追加 | 中 | 継続監視の基盤 |
| 3 | 100m 閾値で `invalidateQueries` | 小 | 無駄な再取得を防ぎつつ自動更新 |
| 4 | `haversineDistance` を `lib/utils.ts` に追加 | 小 | クライアント側距離判定 |

### Phase 2: 体験の向上

| # | 内容 | コスト | 効果 |
|---|------|--------|------|
| 5 | Pulse スコアの動的算出 | 小 | ScanHeader が嘘をつかなくなる |
| 6 | 更新時刻を `dataUpdatedAt` から取得 | 小 | 信頼性向上 |
| 7 | タブ非アクティブ時の位置監視停止 | 小 | バッテリー保護 |
| 8 | `refetchInterval: 60000` 追加 | 1行 | 立ち止まっていても鮮度を保つ |

### Phase 3: 演出

| # | 内容 | コスト | 効果 |
|---|------|--------|------|
| 9 | Layout アニメーション（カード順序変化） | 中 | 距離変動の可視化 |
| 10 | 空状態の文言改善 | 小 | 歩くと変わることを示唆 |
| 11 | 位置情報未許可時の専用画面 | 小 | 価値の伝達 |
| 12 | 「近づいています」バッジ | 中 | 移動体験の可視化 |

---

## 10. やらないこと

| 内容 | 理由 |
|------|------|
| バックグラウンド位置監視 | バッテリー消費が大きすぎる。フォアグラウンドのみで十分 |
| リアルタイム WebSocket でリスト更新 | 投稿の追加は頻繁ではない。Realtime は Talk 画面に限定する方が効率的 |
| 地図表示（MapView） | Google Maps SDK の課金が発生する。Phase 1-3 では距離表示で十分 |
| 距離に応じたプッシュ通知 | 通知機能自体が未実装。後続フェーズで検討 |

---

## 11. 技術的な注意点

### watchPositionAsync のクリーンアップ

```typescript
useEffect(() => {
  let subscription: Location.LocationSubscription | null = null;

  (async () => {
    subscription = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 50, timeInterval: 15000 },
      (loc) => { setLat(loc.coords.latitude); setLng(loc.coords.longitude); }
    );
  })();

  return () => { subscription?.remove(); };
}, []);
```

- `subscription.remove()` を必ず呼ぶ。呼ばないとメモリリーク + バッテリー消費
- タブ切替時に `useIsFocused()` と組み合わせて停止する

### React Query の queryKey と座標

座標をそのまま `queryKey` に入れると、0.0001度の変化でもキャッシュが無効になる。
丸め処理を入れるか、`queryKey` に座標を含めず `invalidateQueries` で手動制御する方法がある。

推奨: **queryKey に座標を含めず、100m 閾値を超えたときに `invalidateQueries` する方式**。

```typescript
// queryKey から座標を外す
queryKey: ["posts", "nearby"],
queryFn: () => fetchNearbyPosts(latRef.current, lngRef.current, radius),
```

これにより、座標の微小変化でキャッシュが無駄に破棄されない。

### SectionList と Layout アニメーション

`SectionList` は `FlatList` のラッパーであり、`itemLayoutAnimation` prop がサポートされない場合がある。
その場合は `Animated.View` + `Layout` を個別アイテムに適用する方式で対応する。

---

## 12. AI 実装用プロンプト

```text
Navios の React Native + Expo プロジェクトで、ちかく画面の「歩くとリストが自動で変わる」体験を実装してください。

目的:
- ユーザーが移動したら、距離が近い投稿が自動的に上に来る
- 手動リフレッシュなしでリストが更新される
- バッテリーと通信量を無駄にしない

前提:
- 位置情報は expo-location の watchPositionAsync を使う
- サーバーへの再問い合わせは 100m 以上移動したときだけ
- React Query の invalidateQueries で再取得をトリガーする
- タブ非アクティブ時は位置監視を停止する

実装要件:

1. hooks/useLocation.ts に watch モードを追加する
   - watch: true のとき watchPositionAsync を使用
   - distanceInterval: 50, timeInterval: 15000
   - useEffect のクリーンアップで subscription.remove()

2. app/(tabs)/index.tsx で 100m 閾値を実装する
   - 前回のクエリ座標からの距離を haversine で計算
   - 100m を超えたら invalidateQueries({ queryKey: ["posts", "nearby"] })
   - 座標は ref で保持（React Query の queryKey には含めない）

3. lib/utils.ts に haversineDistance 関数を追加する

4. keyExtractor を item.id に修正する

5. ScanHeader の Pulse スコアを動的に算出する
   - 投稿数、200m以内率、直近1時間率から算出
   - 更新時刻を dataUpdatedAt から取得

6. useNearbyPosts に refetchInterval: 60000 を追加する

7. タブ非アクティブ時の位置監視停止
   - @react-navigation/native の useIsFocused を使用

実装条件:
- バックグラウンド位置監視はしない
- MapView は使わない
- 既存のアニメーション（FadeInUp、LIVE/HOT脈動）は維持する
- パフォーマンスを意識する（不要な再レンダリングを避ける）
```

---

## 13. 備考

ちかく画面はアプリの顔であり、「距離が近い = 上に来る」というシンプルな原則を徹底するだけで、他のアプリとの明確な差別化になる。

技術的にはそこまで難しくない。`watchPositionAsync` + `invalidateQueries` + 100m 閾値の3つで核心部分は実現できる。重要なのは **やりすぎないこと** — バッテリーと通信を殺さない設計を守れば、地域情報アプリとして非常に強い体験になる。
