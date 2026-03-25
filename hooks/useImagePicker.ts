import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

interface ImagePickerState {
  /** 選択された画像のローカルURI */
  imageUri: string | null;
  /** 画像選択中かどうか */
  isPicking: boolean;
  /** ライブラリから画像を選択 */
  pickImage: () => Promise<void>;
  /** カメラで撮影 */
  takePhoto: () => Promise<void>;
  /** 選択をクリア */
  clear: () => void;
}

/** 画像選択フック */
export function useImagePicker(): ImagePickerState {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const pickImage = async () => {
    setIsPicking(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } finally {
      setIsPicking(false);
    }
  };

  const takePhoto = async () => {
    setIsPicking(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } finally {
      setIsPicking(false);
    }
  };

  const clear = () => setImageUri(null);

  return { imageUri, isPicking, pickImage, takePhoto, clear };
}
