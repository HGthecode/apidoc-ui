export interface DataItemType {
  id: string;
  name: string;
  value?: string;
  desc: string;
  appKey?: string;
}

export type TabKeys = "headers" | "params";
