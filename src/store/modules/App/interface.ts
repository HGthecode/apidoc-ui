import { ApiItem } from "../Apidoc/interface";
export interface AppState {
  title: string;
  theme: "dark" | "light";
  config: ConfigState;
  feConfig: FeConfigState;
  sideWidth: number;
  appKey: string;
  pageData: PageDataState;
}

export type PageDataItemState = ApiItem;

export interface AddPageDataState extends PageDataItemState {
  key: string;
}

export interface PageDataState {
  [key: string]: PageDataItemState;
}

export interface FeConfigState {
  HOST?: string;
}

export interface ConfigState {
  title?: string;
}

export interface GetConfigState {
  appKey?: string;
}

export interface GetApiDataState {
  appKey: string;
}
