import type { LucideIcon } from "lucide-react";

export type TabID = "clients" | "workers" | "tasks";

export interface TabType {
  id: TabID;
  label: string;
  icon: LucideIcon;
  count: number;
}
