export interface DataItemType {
  id: string;
  field: string;
  type: string;
  desc: string;
  [key: string]: any;
}

export type TabKeys = "headers" | "params";
