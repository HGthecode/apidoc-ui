export interface createMdPageKeyState {
  appKey: string;
  path: string;
  [key: string]: any;
}

export interface InputRuleItem {
  required?: boolean;
  pattern?: string;
  message: string;
}
