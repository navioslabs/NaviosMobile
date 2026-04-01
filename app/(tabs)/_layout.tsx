import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Tabs } from "expo-router";
import * as Haptics from "expo-haptics";
import { MessageCircle, Search, Radio, Settings } from "@/lib/icons";
import { makeTokens } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";
import { useBadgeStore } from "@/stores/badgeStore";
import Header from "@/components/layout/Header";
import Fab from "@/components/layout/Fab";

/** 中央タブアイコン（スケール付き） */
function AiTabIcon({ focused, t }: { focused: boolean; t: ReturnType<typeof makeTokens> }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.12 : 1,
      damping: 14,
      stiffness: 150,
      useNativeDriver: true,
      mass: 1,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Search size={24} color={focused ? t.accent : t.sub} />
    </Animated.View>
  );
}

/** 数値バッジ付きアイコン */
function BadgeIcon({ icon: Icon, color, size, count }: { icon: any; color: string; size: number; count: number }) {
  return (
    <View style={{ width: size + 12, height: size + 4, alignItems: "center", justifyContent: "center" }}>
      <Icon size={size} color={color} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
        </View>
      )}
    </View>
  );
}

/** タブナビゲーションレイアウト */
export default function TabLayout() {
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);
  const { talkUnread } = useBadgeStore();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Header t={t} />
      <Tabs
        screenListeners={{
          tabPress: () => Haptics.selectionAsync(),
        }}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: t.accent,
          tabBarInactiveTintColor: t.sub,
          tabBarStyle: {
            backgroundColor: isDark ? "rgba(14,14,24,0.78)" : "rgba(255,255,255,0.82)",
            borderTopColor: t.border,
            borderTopWidth: 1,
            paddingBottom: 6,
          },
          tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "ホーム",
            tabBarIcon: ({ color, size }) => <Radio size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="talk"
          options={{
            title: "タイムライン",
            tabBarIcon: ({ color, size }) => <BadgeIcon icon={MessageCircle} color={color} size={size} count={talkUnread} />,
          }}
        />
        <Tabs.Screen
          name="ai"
          options={{
            title: "さがす",
            tabBarIcon: ({ color, focused }) => <AiTabIcon focused={focused} t={t} />,
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "設定",
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      </Tabs>
      <Fab t={t} isDark={isDark} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#F0425C",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#fff",
  },
});
