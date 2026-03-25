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
        style={{ flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 12, paddingHorizontal: small ? 14 : 20, paddingVertical: small ? 7 : 9 }}
      >
        <Text style={{ color: "#fff", fontSize: small ? 12 : 13, fontWeight: "700", letterSpacing: 0.3 }}>行く</Text>
        <ChevronRight size={14} color="#fff" />
      </LinearGradient>
    </Pressable>
  );
}
