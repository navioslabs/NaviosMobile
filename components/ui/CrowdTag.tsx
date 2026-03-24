import { View, Text, StyleSheet } from "react-native";

interface CrowdTagProps {
  crowd: string;
}

/** 混雑度タグ */
export default function CrowdTag({ crowd }: CrowdTagProps) {
  if (!crowd) return null;
  const color = crowd === "混雑" ? "#F0425C" : crowd === "やや混み" ? "#F5A623" : "#00D4A1";

  return (
    <View style={[styles.tag, { backgroundColor: color + "18" }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{crowd}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  text: { fontSize: 10, fontWeight: "600" },
});
