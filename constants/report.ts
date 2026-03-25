import type { ReportReasonId } from "@/types/post";

/** 通報理由の定義 */
export const REPORT_REASONS: { id: ReportReasonId; label: string; description: string }[] = [
  { id: "spam", label: "スパム・宣伝", description: "無関係な広告や繰り返し投稿" },
  { id: "inappropriate", label: "不適切な内容", description: "暴力的・性的・差別的な内容" },
  { id: "misleading", label: "誤情報・虚偽", description: "事実と異なる情報や詐欺的な内容" },
  { id: "harassment", label: "嫌がらせ・誹謗中傷", description: "特定の人への攻撃や中傷" },
  { id: "dangerous", label: "危険な行為", description: "安全を脅かす行為の助長" },
  { id: "other", label: "その他", description: "上記に当てはまらない問題" },
];
