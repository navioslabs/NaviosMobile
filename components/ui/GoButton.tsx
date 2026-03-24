import { Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight } from "@/lib/icons";

interface GoButtonProps {
  small?: boolean;
  accentColor?: string;
  accentDarkColor?: string;
}

/** 「行く」アクションボタン */
export default function GoButton({ small, accentColor = "#00D4A1", accentDarkColor = "#00B88A" }: GoButtonProps) {
  return (
    <Pressable>
      <LinearGradient
        colors={[accentColor, accentDarkColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className={`flex-row items-center gap-[3px] rounded-xl ${small ? "px-3.5 py-[7px]" : "px-5 py-[9px]"}`}
      >
        <Text className={`text-white font-bold tracking-wide ${small ? "text-xs" : "text-[13px]"}`}>行く</Text>
        <ChevronRight size={14} color="#fff" />
      </LinearGradient>
    </Pressable>
  );
}
