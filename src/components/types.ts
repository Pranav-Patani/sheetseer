import type { ReactElement } from "react";
export type TabID = "clients" | "workers" | "tasks";
export interface TabType {
  id: TabID;
  label: string;
  icon: ReactElement | any;
  count: number;
}
