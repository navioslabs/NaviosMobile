import {
  Shield,
  Calendar,
  Users,
  type LucideIcon,
} from "@/lib/icons";

/** カテゴリID */
export type CategoryId = "lifeline" | "event" | "help";

/** カテゴリ設定 */
export interface CategoryConfig {
  label: string;
  icon: LucideIcon;
  color: string;
}

/** カテゴリマスタ定義 */
export const CAT_CONFIG: Record<CategoryId, CategoryConfig> = {
  lifeline: { label: "ライフライン", icon: Shield, color: "#00D4A1" },
  event: { label: "イベント", icon: Calendar, color: "#F5A623" },
  help: { label: "近助", icon: Users, color: "#F0425C" },
};
