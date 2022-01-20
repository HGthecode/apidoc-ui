export interface FormItemType {
  title: string;
  field: string;
  type: FormItemTypes;
  style?: string;
  class?: string;
  colspan?: number;
  rowspan?: number;
  align?: string;
  titleWidth?: number;
  colon?: boolean;
  onChange?: (appKey: string) => void;
  props?: ObjectType;
  rules?: any;
}

export type FormItemTypes = "input" | "select" | "app-select" | "group-select" | "number";
