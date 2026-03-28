import { useState } from "react";
import { getUserMessage } from "@/lib/appError";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Flag, AlertCircle, Check } from "@/lib/icons";
import { createReport } from "@/lib/reports";
import { REPORT_REASONS } from "@/constants/report";
import type { ReportReasonId } from "@/types/post";
import type { ThemeTokens } from "@/constants/theme";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  t: ThemeTokens;
  targetType: "feed" | "talk" | "nearby";
  targetId: string | number;
}

/** 通報モーダル */
export default function ReportModal({
  visible,
  onClose,
  t,
  targetType,
  targetId,
}: ReportModalProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);

  const [selected, setSelected] = useState<ReportReasonId | null>(null);
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      await createReport({
        target_type: targetType,
        target_id: String(targetId),
        reason: selected,
        detail: detail.trim() || undefined,
      });
      setSubmitted(true);
    } catch (e: unknown) {
      Alert.alert("エラー", getUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelected(null);
    setDetail("");
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: t.surface }]}>
          {submitted ? (
            /* ═══ 送信完了 ═══ */
            <View style={styles.doneWrap}>
              <View
                style={[
                  styles.doneIcon,
                  { backgroundColor: t.accent + "18" },
                ]}
              >
                <Check size={32} color={t.accent} />
              </View>
              <Text
                style={{
                  fontSize: fs.xl,
                  fontWeight: WEIGHT.bold,
                  color: t.text,
                  marginTop: SPACE.lg,
                }}
              >
                通報を受け付けました
              </Text>
              <Text
                style={{
                  fontSize: fs.sm,
                  color: t.sub,
                  textAlign: "center",
                  marginTop: SPACE.sm,
                  lineHeight: 20,
                }}
              >
                内容を確認し、必要に応じて対応いたします。{"\n"}
                ご協力ありがとうございます。
              </Text>
              <Pressable
                onPress={handleClose}
                style={({ pressed }) => [
                  styles.doneButton,
                  {
                    backgroundColor: t.accent,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: fs.base,
                    fontWeight: WEIGHT.bold,
                    color: "#000",
                  }}
                >
                  閉じる
                </Text>
              </Pressable>
            </View>
          ) : (
            /* ═══ 理由選択 ═══ */
            <>
              {/* ハンドル */}
              <View
                style={[styles.handle, { backgroundColor: t.muted + "40" }]}
              />

              {/* ヘッダー */}
              <View style={styles.header}>
                <View
                  style={[
                    styles.headerIcon,
                    { backgroundColor: t.red + "15" },
                  ]}
                >
                  <Flag size={18} color={t.red} />
                </View>
                <Text
                  style={{
                    fontSize: fs.xl,
                    fontWeight: WEIGHT.extrabold,
                    color: t.text,
                  }}
                >
                  通報する
                </Text>
              </View>

              <View style={styles.notice}>
                <AlertCircle size={14} color={t.sub} />
                <Text
                  style={{
                    flex: 1,
                    fontSize: fs.xs,
                    color: t.sub,
                    lineHeight: 18,
                  }}
                >
                  通報は匿名で処理されます。相手に通知されることはありません。
                </Text>
              </View>

              <ScrollView
                style={{ maxHeight: 360 }}
                showsVerticalScrollIndicator={false}
              >
                {REPORT_REASONS.map((reason) => {
                  const isActive = selected === reason.id;
                  return (
                    <Pressable
                      key={reason.id}
                      onPress={() => setSelected(reason.id)}
                      style={({ pressed }) => [
                        styles.reasonRow,
                        {
                          backgroundColor: isActive
                            ? t.accent + "10"
                            : "transparent",
                          borderColor: isActive ? t.accent + "40" : t.border,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.radio,
                          {
                            borderColor: isActive ? t.accent : t.muted,
                            backgroundColor: isActive
                              ? t.accent
                              : "transparent",
                          },
                        ]}
                      >
                        {isActive && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: fs.base,
                            fontWeight: WEIGHT.semibold,
                            color: t.text,
                          }}
                        >
                          {reason.label}
                        </Text>
                        <Text
                          style={{
                            fontSize: fs.xs,
                            color: t.sub,
                            marginTop: 2,
                          }}
                        >
                          {reason.description}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}

                {/* 補足入力 */}
                {selected && (
                  <View style={{ paddingHorizontal: SPACE.xl, marginTop: SPACE.md }}>
                    <Text
                      style={{
                        fontSize: fs.xs,
                        fontWeight: WEIGHT.semibold,
                        color: t.sub,
                        marginBottom: SPACE.sm,
                      }}
                    >
                      補足（任意）
                    </Text>
                    <TextInput
                      value={detail}
                      onChangeText={setDetail}
                      placeholder="具体的な内容があれば入力してください"
                      placeholderTextColor={t.muted}
                      multiline
                      maxLength={300}
                      style={[
                        styles.textInput,
                        {
                          color: t.text,
                          backgroundColor: t.surface2,
                          borderColor: t.border,
                        },
                      ]}
                    />
                    <Text
                      style={{
                        fontSize: fs.xxs,
                        color: t.muted,
                        textAlign: "right",
                        marginTop: SPACE.xs,
                      }}
                    >
                      {detail.length}/300
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* ボタン */}
              <View style={styles.footer}>
                <Pressable
                  onPress={handleClose}
                  style={({ pressed }) => [
                    styles.cancelButton,
                    {
                      backgroundColor: t.surface2,
                      borderColor: t.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: fs.base,
                      fontWeight: WEIGHT.semibold,
                      color: t.sub,
                    }}
                  >
                    キャンセル
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmit}
                  disabled={!selected || submitting}
                  style={({ pressed }) => [
                    styles.submitButton,
                    {
                      backgroundColor: selected ? t.red : t.surface2,
                      opacity: !selected || submitting ? 0.5 : pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: fs.base,
                      fontWeight: WEIGHT.bold,
                      color: selected ? "#fff" : t.muted,
                    }}
                  >
                    {submitting ? "送信中…" : "送信する"}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: SPACE.md,
    marginBottom: SPACE.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.md,
    paddingHorizontal: SPACE.xl,
    marginBottom: SPACE.md,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    marginHorizontal: SPACE.xl,
    marginBottom: SPACE.lg,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
    borderRadius: RADIUS.md,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.md,
    paddingHorizontal: SPACE.xl,
    paddingVertical: SPACE.md + 2,
    borderBottomWidth: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  textInput: {
    fontSize: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACE.md,
    minHeight: 80,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    gap: SPACE.md,
    paddingHorizontal: SPACE.xl,
    paddingTop: SPACE.lg,
  },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACE.md + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  submitButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACE.md + 2,
    borderRadius: RADIUS.md,
  },
  doneWrap: {
    alignItems: "center",
    paddingVertical: SPACE.xxxl,
    paddingHorizontal: SPACE.xl,
  },
  doneIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  doneButton: {
    marginTop: SPACE.xxl,
    paddingHorizontal: SPACE.xxxl,
    paddingVertical: SPACE.md,
    borderRadius: RADIUS.md,
  },
});
