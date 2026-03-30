import { useState, useCallback } from "react";
import { View, ScrollView, Pressable, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { Image } from "expo-image";
import type { ThemeTokens } from "@/constants/theme";
import FullScreenImage from "./FullScreenImage";

interface ImageGalleryProps {
  urls: string[];
  height?: number;
  t: ThemeTokens;
}

/** 横スクロール画像ギャラリー（ドットインジケーター付き） */
export default function ImageGallery({ urls, height = 260, t }: ImageGalleryProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [fullScreenIndex, setFullScreenIndex] = useState(0);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      setActiveIndex(index);
    },
    [width],
  );

  const handleImagePress = useCallback((index: number) => {
    setFullScreenIndex(index);
    setFullScreenVisible(true);
  }, []);

  if (urls.length === 0) return null;

  return (
    <View style={{ position: "relative", height }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {urls.map((uri, i) => (
          <Pressable
            key={uri + i}
            onPress={() => handleImagePress(i)}
            accessibilityLabel={`画像${i + 1}を全画面で表示`}
            accessibilityRole="button"
          >
            <Image
              source={{ uri }}
              style={{ width, height }}
              contentFit="cover"
            />
          </Pressable>
        ))}
      </ScrollView>

      {/* ドットインジケーター（2枚以上の時のみ） */}
      {urls.length > 1 && (
        <View style={{ position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 }}>
          {urls.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === activeIndex ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === activeIndex ? "#fff" : "rgba(255,255,255,0.5)",
              }}
            />
          ))}
        </View>
      )}

      <FullScreenImage
        images={urls}
        initialIndex={fullScreenIndex}
        visible={fullScreenVisible}
        onClose={() => setFullScreenVisible(false)}
      />
    </View>
  );
}
