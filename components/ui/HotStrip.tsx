import { LinearGradient } from "expo-linear-gradient";

/** カードのトップに表示するホットグラデーションライン */
export default function HotStrip() {
  return (
    <LinearGradient
      colors={["#00D4A1", "#4A9EFF", "#8B6FC0", "#F0425C"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-[18px] z-10"
    />
  );
}
