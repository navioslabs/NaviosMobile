import {
  Package,
  Calendar,
  Users,
  Building2,
  type LucideIcon,
} from "@/lib/icons";

/** カテゴリID */
export type CategoryId = "stock" | "event" | "help" | "admin";

/** カテゴリ設定 */
export interface CategoryConfig {
  label: string;
  icon: LucideIcon;
  color: string;
}

/** カテゴリマスタ定義 */
export const CAT_CONFIG: Record<CategoryId, CategoryConfig> = {
  stock: { label: "物資", icon: Package, color: "#00D4A1" },
  event: { label: "イベント", icon: Calendar, color: "#F5A623" },
  help: { label: "近助", icon: Users, color: "#F0425C" },
  admin: { label: "行政", icon: Building2, color: "#8B6FC0" },
};
