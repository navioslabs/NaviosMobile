import { useState } from "react";
import { Platform, StatusBar } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useThemeStore } from "@/stores/themeStore";

const DEFAULT_MAX = 3;

interface ImagePickerState {
  /** 選択された画像のローカルURI一覧 */
  images: string[];
  /** 画像選択中かどうか */
  isPicking: boolean;
  /** 上限に達しているか */
  isFull: boolean;
  /** ライブラリから画像を選択 */
  pickImage: () => Promise<void>;
  /** カメラで撮影 */
  takePhoto: () => Promise<void>;
  /** 特定の画像を削除 */
  removeImage: (index: number) => void;
  /** 全てクリア */
  clearAll: () => void;
  /** 後方互換: 最初の画像URI（null可） */
  imageUri: string | null;
  /** 後方互換: 全クリア */
  clear: () => void;
}

/** 複数画像選択フック */
export function useImagePicker(max = DEFAULT_MAX): ImagePickerState {
  const [images, setImages] = useState<string[]>([]);
  const [isPicking, setIsPicking] = useState(false);

  const isFull = images.length >= max;

  /** Android: 切り抜き画面のヘッダーが見えるようステータスバーを一時的にライトに変更 */
  const setLightStatusBar = () => {
    if (Platform.OS !== "android") return;
    StatusBar.setBarStyle("dark-content");
    StatusBar.setBackgroundColor("#ffffff");
  };

  /** Android: ステータスバーをアプリのテーマに合わせて復元 */
  const restoreStatusBar = () => {
    if (Platform.OS !== "android") return;
    const isDark = useThemeStore.getState().isDark;
    StatusBar.setBarStyle(isDark ? "light-content" : "dark-content");
    StatusBar.setBackgroundColor("transparent");
    StatusBar.setTranslucent(true);
  };

  const pickImage = async () => {
    if (isFull) return;
    setIsPicking(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;

      setLightStatusBar();
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setImages((prev) => [...prev, result.assets[0].uri].slice(0, max));
      }
    } finally {
      restoreStatusBar();
      setIsPicking(false);
    }
  };

  const takePhoto = async () => {
    if (isFull) return;
    setIsPicking(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") return;

      setLightStatusBar();
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setImages((prev) => [...prev, result.assets[0].uri].slice(0, max));
      }
    } finally {
      restoreStatusBar();
      setIsPicking(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => setImages([]);

  return {
    images,
    isPicking,
    isFull,
    pickImage,
    takePhoto,
    removeImage,
    clearAll,
    // 後方互換
    imageUri: images[0] ?? null,
    clear: clearAll,
  };
}
