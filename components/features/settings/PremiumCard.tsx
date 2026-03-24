import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Crown } from "@/lib/icons";

/** プレミアムカード */
export default function PremiumCard() {
  return (
    <LinearGradient colors={["#B8700A", "#E8526A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="mx-4 p-4 rounded-[18px]">
      <View className="flex-row items-center gap-2.5 mb-2">
        <Crown size={20} color="#fff" />
        <Text className="text-white text-base font-bold">プレミアム</Text>
      </View>
      <Text className="text-white/80 text-xs leading-[18px] mb-3">広告非表示、優先サポート、全カテゴリ解放</Text>
      <Pressable className="w-full p-[11px] bg-white rounded-xl items-center">
        <Text className="text-[#B8700A] font-bold text-[13px]">アップグレード</Text>
      </Pressable>
    </LinearGradient>
  );
}
