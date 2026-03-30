import { useState, useCallback, useRef } from "react";
import {
  Modal,
  View,
  Pressable,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Image } from "expo-image";
import { X } from "@/lib/icons";

interface FullScreenImageProps {
  images: string[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}

/** 全画面画像ビューアー（モーダル + スワイプ切り替え） */
export default function FullScreenImage({
  images,
  initialIndex,
  visible,
  onClose,
}: FullScreenImageProps) {
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      setActiveIndex(index);
    },
    [width],
  );

  /** モーダル表示時に initialIndex の位置へスクロール */
  const handleLayout = useCallback(() => {
    if (initialIndex > 0) {
      scrollRef.current?.scrollTo({ x: initialIndex * width, animated: false });
    }
    setActiveIndex(initialIndex);
  }, [initialIndex, width]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        {/* 画像スワイプ領域 */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          onLayout={handleLayout}
          style={StyleSheet.absoluteFill}
          contentContainerStyle={{ alignItems: "center" }}
        >
          {images.map((uri, i) => (
            <Image
              key={uri + i}
              source={{ uri }}
              style={{ width, height }}
              contentFit="contain"
            />
          ))}
        </ScrollView>

        {/* 閉じるボタン */}
        <Pressable
          onPress={onClose}
          accessibilityLabel="画像を閉じる"
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.closeButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          hitSlop={12}
        >
          <X size={24} color="#fff" />
        </Pressable>

        {/* ドットインジケーター（2枚以上） */}
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: i === activeIndex ? 16 : 6,
                    backgroundColor:
                      i === activeIndex ? "#fff" : "rgba(255,255,255,0.5)",
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  closeButton: {
    position: "absolute",
    top: 52,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  dots: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
