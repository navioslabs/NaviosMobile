import { useState, useEffect } from "react";
import { View, Text, Pressable, Modal, useWindowDimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Radio, MessageCircle, Sparkles } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

const ONBOARDING_KEY = "@navios_onboarding_done";

interface Step {
  icon: any;
  iconBg: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: Radio,
    iconBg: "#00D4A1",
    title: "近くの情報を見る",
    description: "歩いているだけで、あなたの周りにある\nリアルタイムな情報が自動で見つかります",
  },
  {
    icon: MessageCircle,
    iconBg: "#4A9EFF",
    title: "トークで交流",
    description: "140文字のひとことを投稿して、\n近くの人とつながりましょう",
  },
  {
    icon: Sparkles,
    iconBg: "#F5A623",
    title: "AIで探す",
    description: "「空いてるカフェ」「近いイベント」など\n自然な言葉で探せます",
  },
];

interface OnboardingTourProps {
  t: ThemeTokens;
}

/** 初回起動時オンボーディングツアー */
export default function OnboardingTour({ t }: OnboardingTourProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const { width } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => {
      if (!v) setVisible(true);
    });
  }, []);

  const finish = () => {
    setVisible(false);
    AsyncStorage.setItem(ONBOARDING_KEY, "1");
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <Modal visible transparent animationType="none" onRequestClose={finish}>
      <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", padding: SPACE.xl }}>
        <Animated.View
          key={step}
          entering={SlideInRight.duration(300).springify().damping(16)}
          exiting={SlideOutLeft.duration(200)}
          style={{
            width: width - SPACE.xl * 2,
            backgroundColor: t.surface,
            borderRadius: RADIUS.xxl + 4,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: t.border,
          }}
        >
          {/* アイコンエリア */}
          <View style={{ alignItems: "center", paddingTop: SPACE.xxxl + 8, paddingBottom: SPACE.xl }}>
            <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: current.iconBg + "20", alignItems: "center", justifyContent: "center", marginBottom: SPACE.xl }}>
              <Icon size={32} color={current.iconBg} />
            </View>
            <Text style={{ fontSize: fs.xxl, fontWeight: WEIGHT.extrabold, color: t.text, textAlign: "center", marginBottom: SPACE.md }}>
              {current.title}
            </Text>
            <Text style={{ fontSize: fs.base, color: t.sub, textAlign: "center", lineHeight: 22, paddingHorizontal: SPACE.xl }}>
              {current.description}
            </Text>
          </View>

          {/* ステップインジケーター */}
          <View style={{ flexDirection: "row", justifyContent: "center", gap: SPACE.sm, marginBottom: SPACE.xl }}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === step ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === step ? t.accent : t.muted + "40",
                }}
              />
            ))}
          </View>

          {/* ボタンエリア */}
          <View style={{ flexDirection: "row", gap: SPACE.md, paddingHorizontal: SPACE.xl, paddingBottom: SPACE.xl }}>
            <Pressable
              onPress={finish}
              accessibilityLabel="スキップ"
              accessibilityRole="button"
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: SPACE.md,
                borderRadius: RADIUS.lg,
                alignItems: "center",
                backgroundColor: t.surface2,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: t.sub }}>スキップ</Text>
            </Pressable>
            <Pressable
              onPress={next}
              accessibilityLabel={isLast ? "はじめる" : "次へ"}
              accessibilityRole="button"
              style={({ pressed }) => ({
                flex: 2,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <LinearGradient
                colors={[t.accent, t.blue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingVertical: SPACE.md, borderRadius: RADIUS.lg, alignItems: "center" }}
              >
                <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: "#000" }}>
                  {isLast ? "はじめる" : "次へ"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
