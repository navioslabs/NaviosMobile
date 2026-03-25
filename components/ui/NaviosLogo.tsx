import { View, Text } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { WEIGHT } from "@/lib/styles";

interface NaviosLogoProps {
  size?: number;
  color?: string;
  textColor?: string;
  showText?: boolean;
}

/**
 * Navios ロゴ
 * 「N」の右上にドット（発信点）、Nの右脚がウェーブに変化するデザイン
 * シンプル・ミニマル・シャープ
 */
export default function NaviosLogo({
  size = 28,
  color = "#00D4A1",
  textColor,
  showText = true,
}: NaviosLogoProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox="0 0 32 32">
          {/* N の左脚 */}
          <Path
            d="M6 26 L6 6"
            stroke={color}
            strokeWidth={4.2}
            strokeLinecap="round"
          />
          {/* N の斜線 */}
          <Path
            d="M6 6 L22 26"
            stroke={color}
            strokeWidth={4.2}
            strokeLinecap="round"
          />
          {/* N の右脚 */}
          <Path
            d="M22 26 L22 6"
            stroke={color}
            strokeWidth={4.2}
            strokeLinecap="round"
          />
          {/* 発信ドット（ピン/電波の原点） */}
          <Circle
            cx="27"
            cy="5.5"
            r="2.8"
            fill={color}
          />
        </Svg>
      </View>
      {showText && (
        <Text
          style={{
            fontSize: size * 0.72,
            fontWeight: WEIGHT.extrabold,
            letterSpacing: -0.5,
            color: textColor || color,
          }}
        >
          navios
        </Text>
      )}
    </View>
  );
}
