import { View, Text } from "react-native";

interface CrowdTagProps {
  crowd: string;
}

/** 混雑度タグ */
export default function CrowdTag({ crowd }: CrowdTagProps) {
  if (!crowd) return null;
  const color = crowd === "混雑" ? "#F0425C" : crowd === "やや混み" ? "#F5A623" : "#00D4A1";

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, backgroundColor: color + "18" }}>
      <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
      <Text style={{ fontSize: 11, fontWeight: "600", color }}>{crowd}</Text>
    </View>
  );
}
