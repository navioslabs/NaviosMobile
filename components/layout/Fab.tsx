import { useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, Platform, StyleSheet } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { Plus, PenLine, Mic } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { useGuestGuard } from "@/hooks/useGuestGuard";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FabProps {
  t: ThemeTokens;
  isDark: boolean;
}

/** フローティングアクションボタン（投稿・つぶやき） */
export default function Fab({ t, isDark }: FabProps) {
  const guard = useGuestGuard();
  const [touchable, setTouchable] = useState(false);
  const progress = useSharedValue(0);
  const rotation = useSharedValue(0);
  const fabScale = useSharedValue(1);

  const open = useCallback(() => {
    setTouchable(true);
    progress.value = withTiming(1, { duration: 250 });
    rotation.value = withSpring(135, { damping: 14, stiffness: 150 });
  }, []);

  const close = useCallback(() => {
    progress.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setTouchable)(false);
    });
    rotation.value = withSpring(0, { damping: 14, stiffness: 150 });
  }, []);

  const handleToggle = useCallback(() => {
    fabScale.value = withSpring(0.92, { damping: 15 }, () => {
      fabScale.value = withSpring(1, { damping: 12 });
    });
    if (progress.value > 0.5) {
      close();
    } else {
      open();
    }
  }, []);

  const handleMenuPress = useCallback((route: string) => {
    close();
    guard(() => router.push(route as any), "投稿");
  }, [guard]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const fabScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.4,
  }));

  const menuItem1Style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.6, 1], [0, 0, 1]),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [30, 0]) }],
  }));

  const menuItem2Style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.3, 0.8], [0, 0, 1]),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [40, 0]) }],
  }));

  return (
    <>
      {/* Backdrop — 常時マウント、opacity で制御 */}
      <AnimatedPressable
        onPress={close}
        pointerEvents={touchable ? "auto" : "none"}
        style={[StyleSheet.absoluteFill, { zIndex: 48, backgroundColor: "#000" }, backdropStyle]}
      />

      {/* Popup menu — 常時マウント、opacity + translateY で制御 */}
      <View
        pointerEvents={touchable ? "box-none" : "none"}
        style={{ position: "absolute", bottom: Platform.OS === "ios" ? 170 : 150, right: 20, zIndex: 52, gap: 12 }}
      >
        {/* トークする */}
        <Animated.View style={menuItem1Style}>
          <Pressable
            onPress={() => handleMenuPress("/talk-post")}
            accessibilityLabel="トークする"
            accessibilityRole="button"
            style={({ pressed }) => ({
              flexDirection: "row" as const,
              alignItems: "center" as const,
              gap: 12,
              borderRadius: 16,
              padding: 16,
              minWidth: 190,
              opacity: pressed ? 0.8 : 1,
              backgroundColor: t.surface,
              borderWidth: 1,
              borderColor: t.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.5 : 0.12,
              shadowRadius: 24,
              elevation: 8,
            })}
          >
            <View style={{ width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: t.blue + "20" }}>
              <Mic size={22} color={t.blue} />
            </View>
            <View>
              <Text style={{ fontSize: 15, fontWeight: "700", color: t.text }}>トークする</Text>
              <Text style={{ fontSize: 13, color: t.sub }}>タイムラインに投稿・24h限定</Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* 投稿する */}
        <Animated.View style={menuItem2Style}>
          <Pressable
            onPress={() => handleMenuPress("/post")}
            accessibilityLabel="投稿する"
            accessibilityRole="button"
            style={({ pressed }) => ({
              flexDirection: "row" as const,
              alignItems: "center" as const,
              gap: 12,
              borderRadius: 16,
              padding: 16,
              minWidth: 190,
              opacity: pressed ? 0.8 : 1,
              backgroundColor: t.surface,
              borderWidth: 1,
              borderColor: t.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.5 : 0.12,
              shadowRadius: 24,
              elevation: 8,
            })}
          >
            <View style={{ width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: t.accent + "20" }}>
              <PenLine size={22} color={t.accent} />
            </View>
            <View>
              <Text style={{ fontSize: 15, fontWeight: "700", color: t.text }}>投稿する</Text>
              <Text style={{ fontSize: 13, color: t.sub }}>ホームのフィードに掲載</Text>
            </View>
          </Pressable>
        </Animated.View>
      </View>

      {/* FAB button */}
      <Animated.View
        style={[
          fabScaleStyle,
          {
            position: "absolute",
            bottom: Platform.OS === "ios" ? 100 : 80,
            right: 20,
            zIndex: 52,
            shadowColor: t.accent,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 12,
          },
        ]}
      >
        <Pressable onPress={handleToggle} accessibilityLabel="新規作成メニュー" accessibilityRole="button">
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              padding: 3,
            }}
          >
            <LinearGradient
              colors={[t.accent, t.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Animated.View style={iconStyle}>
                <Plus size={26} color="#fff" strokeWidth={2.5} />
              </Animated.View>
            </LinearGradient>
          </View>
        </Pressable>
      </Animated.View>
    </>
  );
}
