import { Text, Pressable, StyleSheet } from "react-native";
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
        style={[styles.btn, small && styles.btnSmall]}
      >
        <Text style={[styles.text, small && styles.textSmall]}>行く</Text>
        <ChevronRight size={14} color="#fff" />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 9 },
  btnSmall: { paddingHorizontal: 14, paddingVertical: 7 },
  text: { color: "#fff", fontSize: 13, fontWeight: "700", letterSpacing: 0.3 },
  textSmall: { fontSize: 12 },
});
