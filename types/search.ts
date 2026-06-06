import type { ModuleId } from "@/lib/navigation";

export type GlobalSearchResultType =
  | "product"
  | "customer"
  | "sale"
  | "work-order"
  | "supplier"
  | "category";

export type GlobalSearchResult = {
  id: string;
  type: GlobalSearchResultType;
  title: string;
  subtitle: string;
  module: ModuleId;
};
