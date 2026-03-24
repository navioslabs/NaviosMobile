import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Package, MessageCircle } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";

interface FabProps {
  t: ThemeTokens;
  isDark: boolean;
}

/** フローティングアクションボタン（投稿・つぶやき） */
export default function Fab({ t, isDark }: FabProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <Pressable
          onPress={() => setOpen(false)}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 48, backgroundColor: "rgba(0,0,0,0.4)" }}
        />
      )}

      {/* Popup menu */}
      {open && (
        <View style={{ position: "absolute", bottom: 150, right: 20, zIndex: 52, gap: 12 }}>
          <Pressable
            onPress={() => { setOpen(false); router.push("/post"); }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              borderRadius: 16,
              padding: 16,
              minWidth: 190,
              backgroundColor: t.surface,
              borderWidth: 1,
              borderColor: t.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.5 : 0.12,
              shadowRadius: 24,
              elevation: 8,
            }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: t.accent + "20" }}>
              <Package size={22} color={t.accent} />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "700", color: t.text }}>投稿する</Text>
              <Text style={{ fontSize: 12, color: t.sub }}>イベント・物資・お知らせ</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => { setOpen(false); router.push("/talk-post"); }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              borderRadius: 16,
              padding: 16,
              minWidth: 190,
              backgroundColor: t.surface,
              borderWidth: 1,
              borderColor: t.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.5 : 0.12,
              shadowRadius: 24,
              elevation: 8,
            }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: t.blue + "20" }}>
              <MessageCircle size={22} color={t.blue} />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "700", color: t.text }}>つぶやく</Text>
              <Text style={{ fontSize: 12, color: t.sub }}>近くの人にひとこと</Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* FAB button — large circle */}
      <Pressable
        onPress={() => setOpen((p) => !p)}
        style={{
          position: "absolute",
          bottom: 80,
          right: 20,
          zIndex: 52,
          shadowColor: t.accent,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <LinearGradient
          colors={[t.accent, t.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            alignItems: "center",
            justifyContent: "center",
            transform: [{ rotate: open ? "45deg" : "0deg" }],
          }}
        >
          <Plus size={28} color="#000" strokeWidth={2.5} />
        </LinearGradient>
      </Pressable>
    </>
  );
}
