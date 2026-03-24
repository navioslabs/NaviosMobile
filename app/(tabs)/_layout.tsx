import { Tabs } from "expo-router";
import { Calendar, MessageCircle, Radio, Sparkles, Settings } from "@/lib/icons";
import { View, StyleSheet } from "react-native";
import { makeTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

/** タブナビゲーションレイアウト */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = makeTokens(isDark);

  return (
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
        tabBarLabelStyle: { fontSize: 9, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="talk"
        options={{
          title: "Talk",
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          title: "NearBy",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.centerIcon,
                {
                  backgroundColor: focused ? t.accent : t.surface2,
                  borderColor: focused ? "transparent" : t.border,
                  borderWidth: focused ? 0 : 1,
                },
              ]}
            >
              <Radio size={20} color={focused ? "#000" : t.sub} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI",
          tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
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
