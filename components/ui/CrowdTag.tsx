import { View, Text } from "react-native";

interface CrowdTagProps {
  crowd: string;
}

/** 混雑度タグ */
export default function CrowdTag({ crowd }: CrowdTagProps) {
  if (!crowd) return null;
  const color = crowd === "混雑" ? "#F0425C" : crowd === "やや混み" ? "#F5A623" : "#00D4A1";

  return (
    <View className="flex-row items-center gap-[3px] rounded-lg px-[7px] py-0.5" style={{ backgroundColor: color + "18" }}>
      <View className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-[10px] font-semibold" style={{ color }}>{crowd}</Text>
    </View>
  );
}
