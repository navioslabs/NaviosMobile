import { View, Text } from "react-native";
import Svg, { Rect, Ellipse, Circle } from "react-native-svg";
import { WEIGHT } from "@/lib/styles";

interface NaviosLogoProps {
  size?: number;
  textColor?: string;
  showText?: boolean;
  isDark?: boolean;
}

/** NaviOs ロゴ（地球モチーフ） */
export default function NaviosLogo({
  size = 28,
  textColor = "#00D4A1",
  showText = true,
  isDark = false,
}: NaviosLogoProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
      <Svg width={size} height={size} viewBox="0 0 144 144">
        <Rect width="144" height="144" rx="31.68" fill={isDark ? "transparent" : "#FFFFFF"} />
        <Ellipse cx="72" cy="72" rx="50.976" ry="22.786" fill="none" stroke="#00B88A" strokeWidth="6" opacity="0.22" rotation={-30} origin="72, 72" />
        <Ellipse cx="72" cy="72" rx="50.976" ry="22.786" fill="none" stroke="#00B88A" strokeWidth="6" opacity="0.22" rotation={30} origin="72, 72" />
        <Ellipse cx="72" cy="72" rx="50.976" ry="22.786" fill="none" stroke="#00B88A" strokeWidth="6" opacity="0.22" rotation={90} origin="72, 72" />
        <Circle cx="72" cy="72" r="14.4" fill="#00D4A1" />
        <Circle cx="46" cy="46" r="4.752" fill="#F0425C" />
        <Circle cx="98" cy="46" r="4.752" fill="#F5A623" />
        <Circle cx="98" cy="98" r="4.752" fill="#8B6FC0" />
        <Circle cx="46" cy="98" r="4.752" fill="#4A9EFF" />
        <Circle cx="72" cy="28.7" r="2.448" fill="#00B88A" opacity="0.3" />
        <Circle cx="72" cy="115.3" r="2.448" fill="#00B88A" opacity="0.3" />
      </Svg>
      {showText && (
        <Text
          style={{
            fontSize: size * 0.72,
            fontWeight: WEIGHT.extrabold,
            letterSpacing: -0.5,
            color: textColor,
          }}
        >
          navios
        </Text>
      )}
    </View>
  );
}
