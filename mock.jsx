import {
  Bell,
  Bookmark,
  Building2,
  Calendar,
  Camera,
  ChevronRight,
  Clock,
  Crown,
  Eye,
  Flame,
  Heart,
  Image,
  Locate,
  Lock,
  MapPin,
  MessageCircle,
  MessageSquare,
  Mic,
  Moon,
  Navigation,
  Package,
  Plus,
  Radio,
  Rss,
  Search,
  Send,
  Settings,
  Share,
  Sparkles,
  Sun,
  Timer,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

// ══════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM
// ══════════════════════════════════════════════════════════════════════

const makeTokens = (dark) => ({
  bg: dark ? "#06060C" : "#F6F5F1",
  surface: dark ? "#0E0E18" : "#FFFFFF",
  surface2: dark ? "#161624" : "#F0EFEB",
  surface3: dark ? "#1E1E30" : "#E6E5E1",
  glass: dark ? "rgba(14,14,24,0.78)" : "rgba(255,255,255,0.82)",
  border: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
  text: dark ? "#EEEDF6" : "#0C0C14",
  sub: dark ? "#8887A0" : "#6E6E80",
  muted: dark ? "#4A4962" : "#A0A0B0",
  accent: "#00D4A1",
  accentDark: "#00B88A",
  red: "#F0425C",
  amber: "#F5A623",
  purple: "#8B6FC0",
  blue: "#4A9EFF",
  glow: dark ? "rgba(0,212,161,0.25)" : "rgba(0,212,161,0.18)",
});

const catConfig = {
  stock: { label: "物資", icon: Package, color: "#00D4A1" },
  event: { label: "イベント", icon: Calendar, color: "#F5A623" },
  help: { label: "近助", icon: Users, color: "#F0425C" },
  admin: { label: "行政", icon: Building2, color: "#8B6FC0" },
};

const distLabel = (d) => (d < 1000 ? `${d}m` : `${(d / 1000).toFixed(1)}km`);

// ══════════════════════════════════════════════════════════════════════
// MOCK DATA
// ══════════════════════════════════════════════════════════════════════

const imgs = {
  vegetables:
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=600&fit=crop",
  bread:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=600&fit=crop",
  yoga: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop",
  garden:
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop",
  eggs: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=600&fit=crop",
  cleaning:
    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&h=600&fit=crop",
  office:
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=600&fit=crop",
  daikon:
    "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=600&h=600&fit=crop",
  cooking:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop",
  walking:
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=600&fit=crop",
  flowers:
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=600&fit=crop",
  kids: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=600&fit=crop",
  night:
    "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600&h=600&fit=crop",
  craft:
    "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&h=600&fit=crop",
};

const feedPosts = [
  {
    id: 1,
    user: {
      name: "田中商店",
      avatar: "https://i.pravatar.cc/100?img=1",
      verified: true,
    },
    image: imgs.vegetables,
    likes: 42,
    caption:
      "朝採れ野菜入荷しました！トマト、きゅうり、なす 🍅 本日限り特別価格です",
    time: "10分前",
    category: "stock",
    distance: 50,
    matchScore: 94,
    timeLeft: 42,
    crowd: "混雑",
    hoursAgo: 0.2,
  },
  {
    id: 2,
    user: {
      name: "健康ヨガクラブ",
      avatar: "https://i.pravatar.cc/100?img=5",
      verified: false,
    },
    image: imgs.yoga,
    likes: 89,
    caption: "毎朝7時から中央公園でヨガ会開催中 🧘‍♀️ 初心者歓迎！参加費無料です",
    time: "1時間前",
    category: "event",
    distance: 200,
    matchScore: 88,
    timeLeft: 120,
    crowd: "空いてる",
    hoursAgo: 1,
  },
  {
    id: 3,
    user: {
      name: "ベーカリー佐藤",
      avatar: "https://i.pravatar.cc/100?img=3",
      verified: true,
    },
    image: imgs.bread,
    likes: 156,
    caption: "本日の焼きたてパン 🥐 クロワッサン、食パン、あんぱん揃ってます",
    time: "2時間前",
    category: "stock",
    distance: 280,
    matchScore: 81,
    timeLeft: 85,
    crowd: "やや混み",
    hoursAgo: 2,
  },
  {
    id: 4,
    user: {
      name: "山田さん",
      avatar: "https://i.pravatar.cc/100?img=8",
      verified: false,
    },
    image: imgs.garden,
    likes: 23,
    caption: "庭の草刈りを手伝ってくれる方募集中 🌿 お礼に野菜をお渡しします",
    time: "3時間前",
    category: "help",
    distance: 120,
    matchScore: 76,
    timeLeft: 300,
    crowd: "",
    hoursAgo: 3,
  },
  {
    id: 5,
    user: {
      name: "〇〇市役所",
      avatar: "https://i.pravatar.cc/100?img=12",
      verified: true,
    },
    image: imgs.office,
    likes: 67,
    caption:
      "【重要】給付金申請の締め切りは今月末です 📋 お早めにお手続きください",
    time: "4時間前",
    category: "admin",
    distance: 800,
    matchScore: 62,
    timeLeft: 1440,
    crowd: "",
    hoursAgo: 4,
  },
  {
    id: 6,
    user: {
      name: "佐藤農園",
      avatar: "https://i.pravatar.cc/100?img=15",
      verified: false,
    },
    image: imgs.eggs,
    likes: 98,
    caption: "産みたて卵入荷 🥚 平飼い鶏の新鮮卵、1パック300円です",
    time: "5時間前",
    category: "stock",
    distance: 180,
    matchScore: 85,
    timeLeft: 180,
    crowd: "空いてる",
    hoursAgo: 5,
  },
  {
    id: 7,
    user: {
      name: "地域自治会",
      avatar: "https://i.pravatar.cc/100?img=20",
      verified: true,
    },
    image: imgs.cleaning,
    likes: 45,
    caption: "日曜日に地域清掃活動を行います 🧹 ご参加お待ちしてます！",
    time: "1日前",
    category: "event",
    distance: 350,
    matchScore: 70,
    timeLeft: 480,
    crowd: "",
    hoursAgo: 30,
  },
  {
    id: 8,
    user: {
      name: "鈴木さん",
      avatar: "https://i.pravatar.cc/100?img=25",
      verified: false,
    },
    image: imgs.daikon,
    likes: 34,
    caption: "大根たくさん採れました！お裾分けします 🥬 ご近所さんぜひどうぞ",
    time: "2日前",
    category: "help",
    distance: 180,
    matchScore: 79,
    timeLeft: 240,
    crowd: "空いてる",
    hoursAgo: 48,
  },
  {
    id: 9,
    user: {
      name: "中村花店",
      avatar: "https://i.pravatar.cc/100?img=30",
      verified: false,
    },
    image: imgs.flowers,
    likes: 61,
    caption: "春の花苗セール中 🌸 パンジー・チューリップ・ビオラ揃ってます",
    time: "3日前",
    category: "stock",
    distance: 400,
    matchScore: 73,
    timeLeft: 600,
    crowd: "",
    hoursAgo: 72,
  },
  {
    id: 10,
    user: {
      name: "子育てサークル",
      avatar: "https://i.pravatar.cc/100?img=35",
      verified: true,
    },
    image: imgs.kids,
    likes: 38,
    caption: "週末に親子工作教室を開催します ✂️ 参加費無料・材料込み",
    time: "5日前",
    category: "event",
    distance: 550,
    matchScore: 68,
    timeLeft: 900,
    crowd: "",
    hoursAgo: 120,
  },
];

const nearbyPosts = [
  {
    id: 1,
    category: "stock",
    title: "新鮮野菜入荷！",
    content: "朝採れトマト・きゅうり",
    time: "09:00",
    author: "田中商店",
    distance: 50,
    image: imgs.vegetables,
    matchScore: 94,
  },
  {
    id: 2,
    category: "help",
    title: "草刈りお手伝い募集",
    content: "庭の手入れ",
    time: "10:00",
    author: "山田さん",
    distance: 120,
    image: imgs.garden,
    matchScore: 76,
  },
  {
    id: 3,
    category: "event",
    title: "朝ヨガ会",
    content: "公園で開催・初心者OK",
    time: "07:00",
    author: "健康クラブ",
    distance: 200,
    image: imgs.yoga,
    matchScore: 88,
  },
  {
    id: 4,
    category: "stock",
    title: "焼きたてパン",
    content: "クロワッサン・食パン",
    time: "08:00",
    author: "ベーカリー",
    distance: 280,
    image: imgs.bread,
    matchScore: 81,
  },
  {
    id: 7,
    category: "help",
    title: "大根お裾分け",
    content: "たくさん採れました",
    time: "14:00",
    author: "佐藤さん",
    distance: 180,
    image: imgs.daikon,
    matchScore: 79,
  },
  {
    id: 6,
    category: "event",
    title: "夕方ウォーキング",
    content: "河川敷で健康散歩",
    time: "17:00",
    author: "自治会",
    distance: 350,
    image: imgs.walking,
    matchScore: 70,
  },
  {
    id: 13,
    category: "stock",
    title: "花苗販売",
    content: "春の花々入荷",
    time: "09:00",
    author: "園芸店",
    distance: 380,
    image: imgs.flowers,
    matchScore: 77,
  },
  {
    id: 9,
    category: "event",
    title: "地域清掃活動",
    content: "公民館集合",
    time: "08:00",
    author: "自治会",
    distance: 450,
    image: imgs.cleaning,
    matchScore: 70,
  },
  {
    id: 10,
    category: "help",
    title: "料理教室ボランティア",
    content: "お手伝い募集",
    time: "10:00",
    author: "公民館",
    distance: 500,
    image: imgs.cooking,
    matchScore: 65,
  },
  {
    id: 12,
    category: "event",
    title: "子ども向けイベント",
    content: "工作教室開催",
    time: "14:00",
    author: "児童館",
    distance: 600,
    image: imgs.kids,
    matchScore: 72,
  },
  {
    id: 5,
    category: "admin",
    title: "給付金相談会",
    content: "期限迫る・要予約",
    time: "13:00",
    author: "市役所",
    distance: 800,
    image: imgs.office,
    matchScore: 62,
  },
  {
    id: 8,
    category: "stock",
    title: "産みたて卵",
    content: "平飼い鶏・1パック300円",
    time: "10:00",
    author: "養鶏場",
    distance: 1200,
    image: imgs.eggs,
    matchScore: 85,
  },
  {
    id: 11,
    category: "admin",
    title: "マイナンバー申請会",
    content: "予約不要",
    time: "09:00",
    author: "市役所",
    distance: 1200,
    image: imgs.office,
    matchScore: 58,
  },
];

const chatRooms = [
  {
    id: 1,
    location: "駅前 半径300m",
    msg: "野菜すごく新鮮！トマト甘かった。朝イチで行くのがおすすめ",
    user: "tanaka_fan",
    time: "2分前",
    count: 47,
    avatar: "https://i.pravatar.cc/100?img=31",
    image: imgs.vegetables,
    likes: 23,
  },
  {
    id: 2,
    location: "中央公園エリア",
    msg: "ヨガ会めちゃ気持ちよかった〜 来週も参加したい",
    user: "yoga_love",
    time: "8分前",
    count: 23,
    avatar: "https://i.pravatar.cc/100?img=32",
    image: imgs.yoga,
    likes: 15,
  },
  {
    id: 3,
    location: "商店街エリア",
    msg: "パン屋のクロワッサン、残り少ない！急いだ方がいいかも",
    user: "bread_master",
    time: "15分前",
    count: 89,
    avatar: "https://i.pravatar.cc/100?img=33",
    image: null,
    likes: 41,
  },
  {
    id: 4,
    location: "市役所周辺",
    msg: "給付金の手続き思ったより簡単だった。書類は2枚だけで10分で終わるよ",
    user: "civic_guide",
    time: "22分前",
    count: 12,
    avatar: "https://i.pravatar.cc/100?img=34",
    image: null,
    likes: 8,
  },
  {
    id: 5,
    location: "河川敷エリア",
    msg: "夕方の散歩コース最高すぎる。夕焼けがきれい",
    user: "walk_daily",
    time: "35分前",
    count: 31,
    avatar: "https://i.pravatar.cc/100?img=35",
    image: imgs.walking,
    likes: 56,
  },
];

// ══════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════════════

const PulseRing = ({ color = "#00D4A1", size = 44 }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: -(size * 0.2),
        borderRadius: "50%",
        border: `2px solid ${color}`,
        opacity: 0,
        animation: "pulseRing 2s ease-out infinite",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: -(size * 0.1),
        borderRadius: "50%",
        border: `2px solid ${color}`,
        opacity: 0,
        animation: "pulseRing 2s ease-out 0.6s infinite",
      }}
    />
  </div>
);

const CatPill = ({ cat, t, small }) => {
  const c = catConfig[cat];
  if (!c) return null;
  return (
    <span
      style={{
        background: c.color + "20",
        color: c.color,
        fontSize: small ? 9 : 10,
        fontWeight: 700,
        padding: small ? "2px 6px" : "3px 8px",
        borderRadius: 99,
        letterSpacing: "0.3px",
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: c.color,
          display: "inline-block",
        }}
      />
      {c.label}
    </span>
  );
};

const MatchBadge = ({ score, t }) => (
  <span
    style={{
      background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(8px)",
      borderRadius: 99,
      padding: "3px 8px",
      fontSize: 10,
      fontWeight: 700,
      color: score >= 80 ? "#00D4A1" : score >= 60 ? "#F5A623" : "#8887A0",
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
    }}
  >
    <Zap size={10} /> {score}%
  </span>
);

const HotStrip = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 2.5,
      background: "linear-gradient(90deg, #00D4A1, #4A9EFF, #8B6FC0, #F0425C)",
      borderRadius: "18px 18px 0 0",
    }}
  />
);

const UrgencyBar = ({ timeLeft, t }) => {
  const urgent = timeLeft <= 30;
  const warn = timeLeft <= 60;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        color: urgent ? "#F0425C" : warn ? "#F5A623" : t.sub,
        fontSize: 11,
        fontWeight: urgent ? 700 : 600,
      }}
    >
      <Timer size={12} />
      あと{timeLeft}分
      {urgent && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#F0425C",
            animation: "blink 1s infinite",
            display: "inline-block",
          }}
        />
      )}
    </div>
  );
};

const CrowdTag = ({ crowd, t }) => {
  if (!crowd) return null;
  const color =
    crowd === "混雑" ? "#F0425C" : crowd === "やや混み" ? "#F5A623" : "#00D4A1";
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        color,
        background: color + "18",
        padding: "2px 7px",
        borderRadius: 8,
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      {crowd}
    </span>
  );
};

const GoBtn = ({ t, small }) => (
  <button
    style={{
      background: `linear-gradient(135deg, ${t.accent}, ${t.accentDark})`,
      color: "#fff",
      border: "none",
      borderRadius: 12,
      padding: small ? "7px 14px" : "9px 20px",
      fontSize: small ? 12 : 13,
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 3,
      boxShadow: `0 4px 14px ${t.glow}`,
      transition: "transform .12s",
      letterSpacing: 0.3,
    }}
  >
    行く <ChevronRight size={14} />
  </button>
);

// ══════════════════════════════════════════════════════════════════════
// SCREEN: FEED (Instagram-style + AI enhancements)
// ══════════════════════════════════════════════════════════════════════

const FeedScreen = ({ t, isDark }) => {
  const [selDate, setSelDate] = useState(0); // 0=today, offset in days
  const [selCat, setSelCat] = useState("all");
  const [liked, setLiked] = useState(new Set());

  // Generate 14 days of date chips
  const dateDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const weekday = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    return {
      offset: i,
      day: d.getDate(),
      weekday,
      month: d.getMonth() + 1,
      isWeekend,
    };
  });

  const cats = [
    { id: "all", label: "すべて", icon: Rss },
    ...Object.entries(catConfig).map(([id, c]) => ({
      id,
      label: c.label,
      icon: c.icon,
    })),
  ];

  // Assign posts to dates based on hoursAgo (past) or spread future ones
  const getPostsForDate = (offset) => {
    if (offset === 0) return feedPosts.filter((p) => p.hoursAgo <= 24);
    if (offset === 1)
      return feedPosts.filter((p) => p.hoursAgo > 24 && p.hoursAgo <= 48);
    if (offset <= 3)
      return feedPosts.filter((p) => p.hoursAgo > 48 && p.hoursAgo <= 96);
    // Future dates: cycle through some posts for demo
    return feedPosts.filter((_, i) => i % (offset + 1) === 0);
  };

  const datePosts = getPostsForDate(selDate);
  const filtered =
    selCat === "all"
      ? datePosts
      : datePosts.filter((p) => p.category === selCat);

  return (
    <div style={{ flex: 1, overflowY: "auto", background: t.bg }}>
      {/* Date horizontal scroll */}
      <div
        style={{
          background: t.surface,
          borderBottom: `1px solid ${t.border}`,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: "10px 0 4px 16px",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Calendar size={13} color={t.accent} />
          <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>
            {dateDays[selDate]?.month}月
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "4px 16px 12px",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {dateDays.map((dd) => {
            const active = selDate === dd.offset;
            const isToday = dd.offset === 0;
            const count = getPostsForDate(dd.offset).length;
            return (
              <button
                key={dd.offset}
                onClick={() => setSelDate(dd.offset)}
                style={{
                  flexShrink: 0,
                  width: 48,
                  padding: "8px 0 6px",
                  borderRadius: 14,
                  background: active
                    ? `linear-gradient(135deg,${t.accent},${t.blue})`
                    : "transparent",
                  border: active
                    ? "none"
                    : `1px solid ${isToday ? t.accent + "50" : t.border}`,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  transition: "all .15s",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: active ? "#000" : dd.isWeekend ? t.red : t.muted,
                  }}
                >
                  {dd.weekday}
                </span>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: active ? "#000" : t.text,
                    fontFamily: "'Syne',sans-serif",
                  }}
                >
                  {dd.day}
                </span>
                {count > 0 && (
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: active ? "#000" : t.accent,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date label */}
      <div
        style={{
          padding: "10px 20px 4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 11, color: t.sub }}>
          {selDate === 0
            ? "📍 今日 • 越谷市"
            : selDate === 1
              ? "📅 明日"
              : `📅 ${dateDays[selDate]?.month}/${dateDays[selDate]?.day}`}
        </div>
        <span style={{ fontSize: 10, color: t.accent, fontWeight: 600 }}>
          {filtered.length}件
        </span>
      </div>

      {/* Category chips */}
      <div
        style={{
          display: "flex",
          gap: 7,
          padding: "6px 20px 14px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {cats.map((cat) => {
          const Icon = cat.icon;
          const active = selCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelCat(cat.id)}
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 13px",
                borderRadius: 99,
                background: active ? t.accent : t.surface,
                border: `1px solid ${active ? t.accent : t.border}`,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              <Icon size={12} color={active ? "#000" : t.sub} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: active ? "#000" : t.sub,
                  whiteSpace: "nowrap",
                }}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: "60px 20px", textAlign: "center" }}>
          <Calendar size={32} color={t.muted} />
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: t.sub,
              marginTop: 12,
            }}
          >
            この日の投稿はまだありません
          </div>
        </div>
      ) : (
        <div style={{ paddingBottom: 90 }}>
          {filtered.map((post) => {
            const cc = catConfig[post.category]?.color || t.accent;
            const isLiked = liked.has(post.id);
            return (
              <div
                key={post.id}
                style={{
                  margin: "0 14px 14px",
                  borderRadius: 26,
                  overflow: "hidden",
                  boxShadow: isDark
                    ? "0 2px 12px rgba(0,0,0,0.3)"
                    : "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ position: "relative", aspectRatio: "3/4" }}>
                  <img
                    src={post.image}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    loading="lazy"
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.15) 35%, rgba(0,0,0,.3) 100%)",
                    }}
                  />

                  {/* Top-left: avatar + name + category */}
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <img
                        src={post.user.avatar}
                        alt=""
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid rgba(255,255,255,0.5)",
                        }}
                      />
                      {post.user.verified && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: -1,
                            right: -1,
                            width: 13,
                            height: 13,
                            borderRadius: "50%",
                            background: t.blue,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            style={{
                              color: "#fff",
                              fontSize: 7,
                              fontWeight: 800,
                            }}
                          >
                            ✓
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 12,
                          color: "#fff",
                          textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                        }}
                      >
                        {post.user.name}
                      </span>
                      <div style={{ marginTop: 2 }}>
                        <CatPill cat={post.category} t={t} small />
                      </div>
                    </div>
                  </div>

                  {/* Top-right: time */}
                  <div style={{ position: "absolute", top: 14, right: 14 }}>
                    <span
                      style={{ fontSize: 11, color: "rgba(255,255,255,.6)" }}
                    >
                      {post.time}
                    </span>
                  </div>

                  {/* Right-center: distance badge */}
                  <div
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: "rgba(0,0,0,.5)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 99,
                      padding: "5px 10px",
                    }}
                  >
                    <Navigation size={11} color={t.accent} />
                    <span
                      style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}
                    >
                      {distLabel(post.distance)}
                    </span>
                  </div>

                  {/* Bottom: caption + urgency + actions */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "0 14px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#fff",
                        lineHeight: 1.35,
                        textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                      }}
                    >
                      {post.caption}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 6,
                      }}
                    >
                      <UrgencyBar timeLeft={post.timeLeft} t={t} />
                      {post.crowd && <CrowdTag crowd={post.crowd} t={t} />}
                    </div>

                    {/* Actions — all on image */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <button
                        onClick={() =>
                          setLiked((p) => {
                            const n = new Set(p);
                            n.has(post.id) ? n.delete(post.id) : n.add(post.id);
                            return n;
                          })
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Heart
                          size={18}
                          fill={isLiked ? t.red : "none"}
                          color={isLiked ? t.red : "rgba(255,255,255,.7)"}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: isLiked ? t.red : "rgba(255,255,255,.7)",
                          }}
                        >
                          {post.likes + (isLiked ? 1 : 0)}
                        </span>
                      </button>
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <MessageSquare size={18} color="rgba(255,255,255,.7)" />
                      </button>
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Share size={18} color="rgba(255,255,255,.7)" />
                      </button>
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          marginLeft: "auto",
                        }}
                      >
                        <Bookmark size={18} color="rgba(255,255,255,.7)" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════
// SCREEN: AI (Pulse-driven main screen)
// ══════════════════════════════════════════════════════════════════════

const AiScreen = ({ t, isDark }) => {
  const [query, setQuery] = useState("");

  const quickActions = [
    {
      icon: Package,
      label: "今すぐ買える",
      dc: t.accent,
      bg: isDark ? "#0D2B1E" : "#EAF9F4",
    },
    {
      icon: Calendar,
      label: "今日のイベント",
      dc: "#F5A623",
      bg: isDark ? "#2D1F0A" : "#FEF6E6",
    },
    {
      icon: Users,
      label: "助けを求めてる人",
      dc: t.red,
      bg: isDark ? "#2D0A12" : "#FDEEF0",
    },
    {
      icon: Building2,
      label: "締切が近い手続き",
      dc: t.purple,
      bg: isDark ? "#1A0F2D" : "#F0EBFA",
    },
  ];

  // AI pulse events — sorted by urgency
  const pulseEvents = [...feedPosts]
    .sort((a, b) => a.timeLeft - b.timeLeft)
    .slice(0, 4);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        background: t.bg,
        position: "relative",
      }}
    >
      {/* Ambient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-15%",
            left: "-20%",
            width: "55%",
            height: "55%",
            background: `radial-gradient(circle, ${t.accent}18, transparent 70%)`,
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            right: "-20%",
            width: "55%",
            height: "55%",
            background: `radial-gradient(circle, ${t.purple}15, transparent 70%)`,
            borderRadius: "50%",
          }}
        />
      </div>

      <div
        style={{ position: "relative", zIndex: 1, padding: "20px 20px 100px" }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: `linear-gradient(135deg,${t.accent},${t.blue})`,
              margin: "0 auto 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 10px 28px ${t.glow}`,
              position: "relative",
            }}
          >
            <Sparkles size={26} color="#fff" />
            <PulseRing color={t.accent} size={56} />
          </div>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 24,
              fontWeight: 800,
              color: t.text,
              letterSpacing: "-0.5px",
            }}
          >
            Navios AI
          </div>
          <div style={{ fontSize: 12, color: t.sub, marginTop: 3 }}>
            あなたの地域を、もっとスマートに
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          {isDark && (
            <div
              style={{
                position: "absolute",
                inset: -2,
                borderRadius: 18,
                background: `linear-gradient(135deg,${t.accent},${t.blue})`,
                opacity: 0.2,
                filter: "blur(10px)",
              }}
            />
          )}
          <div
            style={{
              position: "relative",
              background: t.surface,
              borderRadius: 16,
              border: `1px solid ${t.border}`,
              display: "flex",
              alignItems: "center",
              padding: "12px 14px",
              gap: 10,
            }}
          >
            <Search size={17} color={t.sub} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="何をお探しですか？"
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontSize: 14,
                color: t.text,
                fontFamily: "'DM Sans',sans-serif",
              }}
            />
            <button
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: `linear-gradient(135deg,${t.accent},${t.blue})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                boxShadow: `0 4px 12px ${t.glow}`,
              }}
            >
              <Mic size={15} color="#fff" />
            </button>
          </div>
        </div>

        {/* Pulse Score */}
        <div
          style={{
            background: isDark
              ? "rgba(0,212,161,0.06)"
              : "rgba(0,212,161,0.08)",
            border: `1px solid ${t.accent}22`,
            borderRadius: 16,
            padding: "14px 16px",
            marginBottom: 22,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: t.accent + "22",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <Radio size={20} color={t.accent} />
            <PulseRing color={t.accent} size={42} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>
              Pulse スコア: 82 / 100
            </div>
            <div style={{ fontSize: 11, color: t.sub }}>
              周辺エリアの盛り上がり度
            </div>
          </div>
          <div
            style={{
              background: t.accent,
              color: "#000",
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 10,
              fontWeight: 800,
            }}
          >
            HOT
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 22 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: t.sub,
              marginBottom: 8,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            クイックアクション
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {quickActions.map((a, i) => {
              const Icon = a.icon;
              return (
                <button
                  key={i}
                  style={{
                    background: a.bg,
                    border: `1px solid ${a.dc}22`,
                    borderRadius: 16,
                    padding: 14,
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: a.dc + "20",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={17} color={a.dc} />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: t.text,
                      lineHeight: 1.3,
                    }}
                  >
                    {a.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Pulse Feed — urgency sorted cards */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: t.text,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Zap size={14} color={t.accent} /> 今すぐ行くべき順
            </span>
            <span style={{ fontSize: 10, color: t.accent, fontWeight: 600 }}>
              リアルタイム
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pulseEvents.map((ev, i) => {
              const cc = catConfig[ev.category]?.color || t.accent;
              const isHot = ev.matchScore >= 85;
              return (
                <div
                  key={ev.id}
                  style={{
                    background: t.surface,
                    borderRadius: 18,
                    overflow: "hidden",
                    border: isHot
                      ? `1.5px solid ${t.accent}35`
                      : `1px solid ${t.border}`,
                    boxShadow: isHot ? `0 6px 24px ${t.glow}` : "none",
                    position: "relative",
                    animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
                  }}
                >
                  {isHot && <HotStrip />}
                  <div style={{ display: "flex", gap: 12, padding: 14 }}>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 14,
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={ev.image}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 4,
                        }}
                      >
                        {isHot && (
                          <span
                            style={{
                              background:
                                "linear-gradient(135deg,#F0425C,#F5A623)",
                              color: "#fff",
                              fontSize: 9,
                              fontWeight: 700,
                              padding: "2px 7px",
                              borderRadius: 99,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <Flame size={9} /> HOT
                          </span>
                        )}
                        <CatPill cat={ev.category} t={t} small />
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: t.text,
                          lineHeight: 1.3,
                          marginBottom: 5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {ev.user.name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                            fontSize: 11,
                            color: t.accent,
                            fontWeight: 600,
                          }}
                        >
                          <Navigation size={10} /> {distLabel(ev.distance)}
                        </span>
                        <UrgencyBar timeLeft={ev.timeLeft} t={t} />
                        {ev.crowd && <CrowdTag crowd={ev.crowd} t={t} />}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        flexShrink: 0,
                      }}
                    >
                      <MatchBadge score={ev.matchScore} t={t} />
                      <GoBtn t={t} small />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Auto check-in card */}
        <div
          style={{
            background: isDark ? "#0F1A14" : "#EAF9F4",
            border: `1px solid ${t.accent}28`,
            borderRadius: 16,
            padding: "14px 16px",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: t.accent + "20",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MapPin size={20} color={t.accent} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: t.text,
              }}
            >
              AIオートチェックイン
            </div>
            <div style={{ fontSize: 11, color: t.sub, lineHeight: 1.4 }}>
              現地に近づいたら自動で通知
            </div>
          </div>
          <button
            style={{
              background: t.accent,
              borderRadius: 99,
              padding: "6px 12px",
              fontSize: 11,
              fontWeight: 700,
              color: "#000",
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            ON
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════
// SCREEN: NEARBY (distance-based visual grid — 2-column only)
// ══════════════════════════════════════════════════════════════════════

const NearByScreen = ({ t, isDark }) => {
  const [scanning, setScanning] = useState(true);
  const sorted = [...nearbyPosts].sort((a, b) => a.distance - b.distance);

  // Auto-complete scan after 2s
  useState(() => {
    const timer = setTimeout(() => setScanning(false), 2000);
    return () => clearTimeout(timer);
  });

  return (
    <div style={{ flex: 1, overflowY: "auto", background: t.bg }}>
      {/* Scanning header */}
      <div
        style={{
          padding: "16px 20px",
          background: isDark ? "rgba(0,212,161,0.05)" : "rgba(0,212,161,0.07)",
          borderBottom: `1px solid ${t.border}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated scan line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`,
            animation: "scanLine 2s ease-in-out infinite",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: t.accent + "18",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Radio
              size={20}
              color={t.accent}
              style={{ animation: "pulse 1.5s ease-in-out infinite" }}
            />
            <PulseRing color={t.accent} size={42} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: t.text,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              周辺をスキャン中
              <span style={{ display: "inline-flex", gap: 2 }}>
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: t.accent,
                    animation: "blink 1.4s infinite",
                  }}
                />
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: t.accent,
                    animation: "blink 1.4s 0.2s infinite",
                  }}
                />
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: t.accent,
                    animation: "blink 1.4s 0.4s infinite",
                  }}
                />
              </span>
            </div>
            <div style={{ fontSize: 11, color: t.sub, marginTop: 2 }}>
              {sorted.length}件のイベントを検出 • 越谷市周辺
            </div>
          </div>
          <div
            style={{
              background: t.accent,
              color: "#000",
              borderRadius: 10,
              padding: "5px 10px",
              fontSize: 11,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Eye size={12} /> LIVE
          </div>
        </div>
      </div>

      {/* Distance-sorted list */}
      <div style={{ padding: "8px 12px 100px" }}>
        {sorted.map((post, i) => {
          const cc = catConfig[post.category]?.color || t.accent;
          const isClose = post.distance <= 200;
          return (
            <div
              key={post.id}
              style={{
                display: "flex",
                gap: 12,
                padding: "12px 10px",
                borderBottom: `1px solid ${t.border}`,
                animation: `fadeUp 0.4s ease ${i * 0.06}s both`,
                position: "relative",
              }}
            >
              {/* Distance indicator line */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: 48,
                  flexShrink: 0,
                  gap: 4,
                  paddingTop: 2,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: isClose ? t.accent : t.text,
                    fontFamily: "'Syne',sans-serif",
                  }}
                >
                  {distLabel(post.distance)}
                </div>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: isClose ? t.accent : cc,
                    boxShadow: isClose ? `0 0 8px ${t.accent}` : "none",
                    position: "relative",
                  }}
                >
                  {isClose && <PulseRing color={t.accent} size={8} />}
                </div>
                <div
                  style={{
                    flex: 1,
                    width: 1.5,
                    background: t.border,
                    minHeight: 20,
                  }}
                />
              </div>

              {/* Image */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 14,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={post.image}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <CatPill cat={post.category} t={t} small />
                  {isClose && (
                    <span
                      style={{
                        background: t.accent + "20",
                        color: t.accent,
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 99,
                      }}
                    >
                      すぐ近く
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: t.text,
                    lineHeight: 1.3,
                    marginBottom: 3,
                  }}
                >
                  {post.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: t.sub,
                    lineHeight: 1.3,
                    marginBottom: 4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {post.content}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 11,
                    color: t.muted,
                  }}
                >
                  <span>{post.author}</span>
                  <span>•</span>
                  <Clock size={10} color={t.muted} />
                  <span>{post.time}</span>
                  <MatchBadge score={post.matchScore} t={t} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════
// SCREEN: TALK (location-based chat)
// ══════════════════════════════════════════════════════════════════════

const TalkScreen = ({ t, isDark }) => {
  const [likedChats, setLikedChats] = useState(new Set());
  return (
    <div style={{ flex: 1, overflowY: "auto", background: t.bg }}>
      {/* Header */}
      <div style={{ padding: "14px 20px 10px" }}>
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 20,
            fontWeight: 800,
            color: t.text,
          }}
        >
          Talk
        </div>
        <div style={{ fontSize: 12, color: t.sub }}>
          近くのつぶやきをキャッチ
        </div>
      </div>

      {/* Tweet-style timeline */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {chatRooms.map((c) => {
          const isLiked = likedChats.has(c.id);
          return (
            <div
              key={c.id}
              style={{
                padding: "14px 20px",
                borderBottom: `1px solid ${t.border}`,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                {/* Avatar */}
                <img
                  src={c.avatar}
                  alt=""
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Name + handle + time */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{ fontSize: 13, fontWeight: 700, color: t.text }}
                    >
                      @{c.user}
                    </span>
                    <span style={{ fontSize: 11, color: t.muted }}>•</span>
                    <span style={{ fontSize: 11, color: t.muted }}>
                      {c.time}
                    </span>
                  </div>

                  {/* Location tag */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                      marginBottom: 6,
                      background: t.accent + "12",
                      borderRadius: 99,
                      padding: "2px 8px",
                    }}
                  >
                    <MapPin size={9} color={t.accent} />
                    <span
                      style={{ fontSize: 10, fontWeight: 600, color: t.accent }}
                    >
                      {c.location}
                    </span>
                  </div>

                  {/* Message text */}
                  <div
                    style={{
                      fontSize: 14,
                      color: t.text,
                      lineHeight: 1.5,
                      marginBottom: c.image ? 10 : 0,
                    }}
                  >
                    {c.msg}
                  </div>

                  {/* Small image thumbnail if exists */}
                  {c.image && (
                    <div
                      style={{
                        width: "100%",
                        height: 140,
                        borderRadius: 14,
                        overflow: "hidden",
                        marginBottom: 2,
                        border: `1px solid ${t.border}`,
                      }}
                    >
                      <img
                        src={c.image}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Actions row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      marginTop: 8,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <MessageCircle size={15} color={t.muted} />
                      <span style={{ fontSize: 11, color: t.muted }}>
                        {c.count}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setLikedChats((p) => {
                          const n = new Set(p);
                          n.has(c.id) ? n.delete(c.id) : n.add(c.id);
                          return n;
                        })
                      }
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Heart
                        size={15}
                        fill={isLiked ? t.red : "none"}
                        color={isLiked ? t.red : t.muted}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: isLiked ? t.red : t.muted,
                        }}
                      >
                        {c.likes + (isLiked ? 1 : 0)}
                      </span>
                    </button>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Share size={15} color={t.muted} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ height: 90 }} />
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════
// SCREEN: SETTINGS
// ══════════════════════════════════════════════════════════════════════

const SettingsScreen = ({ t, isDark, setTheme }) => (
  <div
    style={{ flex: 1, overflowY: "auto", background: t.bg, paddingBottom: 100 }}
  >
    {/* Profile */}
    <div
      style={{
        background: t.surface,
        padding: 20,
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: `linear-gradient(135deg,${t.accent},${t.blue})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <User size={24} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 700,
              fontSize: 17,
              color: t.text,
            }}
          >
            ゲストユーザー
          </div>
          <div style={{ fontSize: 12, color: t.sub, marginTop: 2 }}>
            プロフィールを設定
          </div>
        </div>
        <ChevronRight size={18} color={t.muted} />
      </div>
    </div>

    {/* Stats */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        padding: "16px 20px",
        background: t.surface,
        marginTop: 8,
        borderTop: `1px solid ${t.border}`,
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      {[
        { v: "56", l: "チェックイン" },
        { v: "8", l: "バッジ" },
      ].map((s) => (
        <div key={s.l} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: t.accent }}>
            {s.v}
          </div>
          <div style={{ fontSize: 10, color: t.sub }}>{s.l}</div>
        </div>
      ))}
    </div>

    {/* Theme */}
    <div
      style={{
        background: t.surface,
        marginTop: 8,
        borderTop: `1px solid ${t.border}`,
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isDark ? (
            <Moon size={18} color={t.purple} />
          ) : (
            <Sun size={18} color="#F5A623" />
          )}
          <span style={{ fontSize: 15, color: t.text }}>テーマ</span>
        </div>
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          style={{
            width: 50,
            height: 28,
            borderRadius: 99,
            background: isDark ? t.accent : t.surface3,
            position: "relative",
            border: "none",
            cursor: "pointer",
            transition: "background .2s",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 2,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: isDark ? "#000" : "#fff",
              boxShadow: "0 1px 4px rgba(0,0,0,.2)",
              transition: "transform .2s",
              transform: isDark ? "translateX(24px)" : "translateX(2px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isDark ? (
              <Moon size={11} color={t.accent} />
            ) : (
              <Sun size={11} color="#F5A623" />
            )}
          </div>
        </button>
      </div>
    </div>

    {/* Premium */}
    <div
      style={{
        margin: "12px 16px",
        padding: 16,
        background: "linear-gradient(135deg,#B8700A,#E8526A)",
        borderRadius: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <Crown size={20} color="#fff" />
        <span
          style={{
            color: "#fff",
            fontFamily: "'Syne',sans-serif",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          プレミアム
        </span>
      </div>
      <p
        style={{
          color: "rgba(255,255,255,.8)",
          fontSize: 12,
          lineHeight: 1.5,
          margin: "0 0 12px",
        }}
      >
        広告非表示、優先サポート、全カテゴリ解放
      </p>
      <button
        style={{
          width: "100%",
          padding: 11,
          background: "#fff",
          borderRadius: 12,
          border: "none",
          cursor: "pointer",
          color: "#B8700A",
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        アップグレード
      </button>
    </div>

    {/* Menu */}
    <div
      style={{
        background: t.surface,
        marginTop: 8,
        borderTop: `1px solid ${t.border}`,
      }}
    >
      {[
        { icon: Bell, label: "通知設定" },
        { icon: Lock, label: "プライバシー" },
      ].map((item, i) => {
        const Icon = item.icon;
        return (
          <button
            key={i}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 20px",
              background: "none",
              border: "none",
              borderBottom: `1px solid ${t.border}`,
              cursor: "pointer",
            }}
          >
            <Icon size={17} color={t.sub} />
            <span
              style={{
                flex: 1,
                fontSize: 14,
                color: t.text,
                textAlign: "left",
              }}
            >
              {item.label}
            </span>
            <ChevronRight size={15} color={t.muted} />
          </button>
        );
      })}
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════
// SCREEN: TALK POST (quick tweet-style)
// ══════════════════════════════════════════════════════════════════════

const TalkPostScreen = ({ t, isDark, onClose }) => {
  const [msg, setMsg] = useState("");

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        background: t.bg,
        padding: "16px 20px 40px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Avatar + input */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: `linear-gradient(135deg,${t.accent},${t.blue})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <User size={20} color="#fff" />
          </div>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="この場所で何が起きてる？"
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              fontSize: 16,
              color: t.text,
              fontFamily: "'DM Sans',sans-serif",
              resize: "none",
              minHeight: 120,
              lineHeight: 1.5,
            }}
            autoFocus
          />
        </div>

        {/* Location tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
          }}
        >
          <MapPin size={15} color={t.accent} />
          <span style={{ fontSize: 12, color: t.accent, fontWeight: 600 }}>
            📍 越谷市・現在地周辺
          </span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: t.muted }}>
            自動検出
          </span>
        </div>

        {/* Photo option */}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { Icon: Camera, l: "撮影" },
            { Icon: Image, l: "選択" },
          ].map(({ Icon, l }) => (
            <button
              key={l}
              style={{
                width: 60,
                height: 60,
                borderRadius: 14,
                border: `1.5px dashed ${t.border}`,
                background: t.surface,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                cursor: "pointer",
              }}
            >
              <Icon size={18} color={t.sub} />
              <span style={{ fontSize: 9, color: t.sub }}>{l}</span>
            </button>
          ))}
        </div>

        {/* Character count + submit */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{ fontSize: 11, color: msg.length > 140 ? t.red : t.muted }}
          >
            {msg.length}/140
          </span>
          <button
            style={{
              padding: "11px 28px",
              background:
                msg.length > 0
                  ? `linear-gradient(135deg,${t.accent},${t.blue})`
                  : t.surface2,
              border: "none",
              borderRadius: 14,
              color: msg.length > 0 ? "#000" : t.muted,
              fontWeight: 800,
              fontSize: 14,
              cursor: msg.length > 0 ? "pointer" : "default",
              fontFamily: "'Syne',sans-serif",
              boxShadow: msg.length > 0 ? `0 6px 20px ${t.glow}` : "none",
              transition: "all .2s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Send size={14} /> つぶやく
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════
// SCREEN: POST
// ══════════════════════════════════════════════════════════════════════

const PostScreen = ({ t, isDark, onClose }) => {
  const [cat, setCat] = useState("stock");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: 12,
    fontSize: 14,
    color: t.text,
    outline: "none",
    fontFamily: "'DM Sans',sans-serif",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        background: t.bg,
        padding: "16px 20px 40px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Category */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: t.sub,
              marginBottom: 8,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            カテゴリ
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 8,
            }}
          >
            {Object.entries(catConfig).map(([id, c]) => {
              const Icon = c.icon;
              const active = cat === id;
              return (
                <button
                  key={id}
                  onClick={() => setCat(id)}
                  style={{
                    padding: "12px 6px",
                    borderRadius: 14,
                    border: `1px solid ${active ? c.color : t.border}`,
                    background: active ? c.color + "18" : t.surface,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Icon size={18} color={active ? c.color : t.sub} />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: active ? c.color : t.sub,
                    }}
                  >
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: t.sub,
              marginBottom: 8,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            タイトル
          </div>
          <input
            style={inputStyle}
            placeholder="タイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: t.sub,
              marginBottom: 8,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            詳細
          </div>
          <textarea
            style={{ ...inputStyle, height: 88, resize: "none" }}
            placeholder="詳細を入力"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: t.sub,
              marginBottom: 8,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            写真
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { Icon: Camera, l: "撮影" },
              { Icon: Image, l: "選択" },
            ].map(({ Icon, l }) => (
              <button
                key={l}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 14,
                  border: `1.5px dashed ${t.border}`,
                  background: t.surface,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  cursor: "pointer",
                }}
              >
                <Icon size={20} color={t.sub} />
                <span style={{ fontSize: 10, color: t.sub }}>{l}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            cursor: "pointer",
            width: "100%",
          }}
        >
          <MapPin size={17} color={t.sub} />
          <span
            style={{ flex: 1, fontSize: 13, color: t.sub, textAlign: "left" }}
          >
            場所を設定
          </span>
          <Locate size={15} color={t.sub} />
        </button>

        <button
          style={{
            width: "100%",
            padding: 15,
            background: `linear-gradient(135deg,${t.accent},${t.blue})`,
            border: "none",
            borderRadius: 14,
            color: "#000",
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
            fontFamily: "'Syne',sans-serif",
            boxShadow: `0 8px 24px ${t.glow}`,
          }}
        >
          投稿する
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════
// APP SHELL
// ══════════════════════════════════════════════════════════════════════

const navTabs = [
  { id: "feed", icon: Calendar, label: "Feed" },
  { id: "talk", icon: MessageCircle, label: "Talk" },
  { id: "nearby", icon: Radio, label: "NearBy" },
  { id: "navios", icon: Sparkles, label: "AI" },
  { id: "settings", icon: Settings, label: "設定" },
];

export default function NaviosApp() {
  const [view, setView] = useState("feed");
  const [theme, setTheme] = useState("dark");
  const [fabOpen, setFabOpen] = useState(false);
  const isDark = theme === "dark";
  const t = makeTokens(isDark);

  const isPosting = view === "post" || view === "talk_post";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes pulseRing{0%{transform:scale(1);opacity:.5}100%{transform:scale(1.8);opacity:0}}
        @keyframes pulseOverlay{0%,100%{opacity:0}50%{opacity:.15}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scanLine{0%{transform:translateX(-100%)}50%{transform:translateX(100%)}100%{transform:translateX(-100%)}}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0}
        body{margin:0;background:#000;font-family:'DM Sans',sans-serif}
        input::placeholder,textarea::placeholder{color:${t.sub}}
        ::-webkit-scrollbar{display:none}
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 430,
          margin: "0 auto",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "'DM Sans',sans-serif",
          background: t.bg,
          boxShadow: "0 0 60px rgba(0,0,0,.5)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            background: t.surface,
            borderBottom: `1px solid ${t.border}`,
            padding: "14px 20px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          {isPosting ? (
            <>
              <button
                onClick={() => setView("feed")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={22} color={t.text} />
              </button>
              <span
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 700,
                  fontSize: 17,
                  color: t.text,
                }}
              >
                {view === "post" ? "新規投稿" : "つぶやく"}
              </span>
              <div style={{ width: 30 }} />
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background: `linear-gradient(135deg,${t.accent},${t.blue})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 12px ${t.glow}`,
                  }}
                >
                  <Navigation size={14} color="#000" />
                </div>
                <span
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 800,
                    fontSize: 19,
                    letterSpacing: "-0.3px",
                    background: `linear-gradient(135deg,${t.accent},${t.blue})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Navios
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: t.surface2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${t.border}`,
                    cursor: "pointer",
                  }}
                >
                  <Bell size={15} color={t.sub} />
                </button>
                <button
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: t.surface2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${t.border}`,
                    cursor: "pointer",
                  }}
                >
                  <User size={15} color={t.sub} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* CONTENT */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {view === "feed" && <FeedScreen t={t} isDark={isDark} />}
          {view === "navios" && <AiScreen t={t} isDark={isDark} />}
          {view === "nearby" && <NearByScreen t={t} isDark={isDark} />}
          {view === "talk" && <TalkScreen t={t} isDark={isDark} />}
          {view === "settings" && (
            <SettingsScreen t={t} isDark={isDark} setTheme={setTheme} />
          )}
          {view === "post" && (
            <PostScreen t={t} isDark={isDark} onClose={() => setView("feed")} />
          )}
          {view === "talk_post" && (
            <TalkPostScreen
              t={t}
              isDark={isDark}
              onClose={() => setView("talk")}
            />
          )}
        </div>

        {/* FAB + popup menu */}
        {!isPosting && (
          <>
            {/* Backdrop */}
            {fabOpen && (
              <div
                onClick={() => setFabOpen(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  zIndex: 48,
                  transition: "opacity .2s",
                }}
              />
            )}

            {/* Popup options */}
            {fabOpen && (
              <div
                style={{
                  position: "fixed",
                  bottom: 134,
                  right: "max(calc(50% - 215px + 14px), 14px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  zIndex: 52,
                  animation: "fadeUp 0.2s ease both",
                }}
              >
                <button
                  onClick={() => {
                    setFabOpen(false);
                    setView("post");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    borderRadius: 16,
                    padding: "12px 18px",
                    cursor: "pointer",
                    boxShadow: isDark
                      ? "0 8px 24px rgba(0,0,0,0.5)"
                      : "0 8px 24px rgba(0,0,0,0.12)",
                    minWidth: 170,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: t.accent + "20",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Package size={18} color={t.accent} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div
                      style={{ fontSize: 13, fontWeight: 700, color: t.text }}
                    >
                      投稿する
                    </div>
                    <div style={{ fontSize: 10, color: t.sub }}>
                      イベント・物資・お知らせ
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setFabOpen(false);
                    setView("talk_post");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    borderRadius: 16,
                    padding: "12px 18px",
                    cursor: "pointer",
                    boxShadow: isDark
                      ? "0 8px 24px rgba(0,0,0,0.5)"
                      : "0 8px 24px rgba(0,0,0,0.12)",
                    minWidth: 170,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: t.blue + "20",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MessageCircle size={18} color={t.blue} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div
                      style={{ fontSize: 13, fontWeight: 700, color: t.text }}
                    >
                      つぶやく
                    </div>
                    <div style={{ fontSize: 10, color: t.sub }}>
                      近くの人にひとこと
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* FAB button */}
            <button
              onClick={() => setFabOpen((p) => !p)}
              style={{
                position: "fixed",
                bottom: 76,
                right: "max(calc(50% - 215px + 14px), 14px)",
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: `linear-gradient(135deg,${t.accent},${t.blue})`,
                border: `3px solid ${t.bg}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 52,
                boxShadow: `0 6px 20px ${t.glow}`,
                transform: fabOpen ? "rotate(45deg)" : "rotate(0deg)",
                transition: "transform .2s ease",
              }}
            >
              <Plus size={22} color="#000" strokeWidth={2.5} />
            </button>
          </>
        )}

        {/* BOTTOM NAV */}
        {!isPosting && (
          <div
            style={{
              background: t.glass,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderTop: `1px solid ${t.border}`,
              display: "flex",
              flexShrink: 0,
              paddingBottom: 6,
              position: "relative",
              zIndex: 40,
            }}
          >
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const active = view === tab.id;
              const isCenter = tab.id === "nearby";
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    padding: "9px 0 6px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {isCenter ? (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 14,
                        marginTop: -12,
                        background: active
                          ? `linear-gradient(135deg,${t.accent},${t.blue})`
                          : t.surface2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: active ? `0 4px 16px ${t.glow}` : "none",
                        border: active ? "none" : `1px solid ${t.border}`,
                        transition: "all .2s",
                      }}
                    >
                      <Icon size={20} color={active ? "#000" : t.sub} />
                    </div>
                  ) : (
                    <Icon
                      size={20}
                      strokeWidth={active ? 2.4 : 1.7}
                      color={active ? t.accent : t.sub}
                    />
                  )}
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: active ? 700 : 500,
                      color: active ? t.accent : t.sub,
                    }}
                  >
                    {tab.label}
                  </span>
                  {active && !isCenter && (
                    <div
                      style={{
                        width: 14,
                        height: 2,
                        borderRadius: 1,
                        background: t.accent,
                        marginTop: 1,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
