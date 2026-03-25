import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Rss, MessageCircle, Sparkles, Radio, Settings } from "@/lib/icons";
import { makeTokens } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";
import Header from "@/components/layout/Header";
import Fab from "@/components/layout/Fab";

/** 中央タブアイコン（スケール + グロー付き） */
function AiTabIcon({ focused, t }: { focused: boolean; t: ReturnType<typeof makeTokens> }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.12 : 1, { damping: 14, stiffness: 150 });
  }, [focused]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.centerIcon,
        animStyle,
        {
          backgroundColor: focused ? t.accent : t.surface2,
          borderColor: focused ? "transparent" : t.border,
          borderWidth: focused ? 0 : 1,
          shadowColor: t.accent,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: focused ? 0.4 : 0,
          shadowRadius: focused ? 12 : 0,
          elevation: focused ? 6 : 0,
        },
      ]}
    >
      <Sparkles size={20} color={focused ? "#000" : t.sub} />
    </Animated.View>
  );
}

/** タブナビゲーションレイアウト */
export default function TabLayout() {
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Header t={t} />
      <Tabs
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
            title: "ちかく",
            tabBarIcon: ({ color, size }) => <Radio size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="talk"
          options={{
            title: "タイムライン",
            tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
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
          options={{
            title: "フィード",
            tabBarIcon: ({ color, size }) => <Rss size={size} color={color} />,
          }}
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
  centerIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    marginTop: -12,
    alignItems: "center",
    justifyContent: "center",
  },
});
