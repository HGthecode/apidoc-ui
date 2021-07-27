import { ApiItem } from "@/api/interface/apiData";
import { ConfigInfo } from "@/api/interface/config";
import { ThemeEnum } from "@/enums/appEnum";

export interface AppState {
  title: string;
  theme: ThemeEnum;
  config: ConfigInfo;
  feConfig: FeConfigState;
  sideWidth: number;
  appKey: string;
  pageData: PageDataState;
  keepAlivePages: string[];
  isMobile: boolean;
  isOpenSide: boolean;
}

export type PageDataItemState = ApiItem;

export interface AddPageDataState extends PageDataItemState {
  key?: string;
}

export interface PageDataState {
  [key: string]: PageDataItemState;
}

export interface FeConfigState {
  HOST?: string;
  CACHE?: FeConfigCecheState;
}

export interface FeConfigCecheState {
  PREFIX: string;
}

// export interface ConfigState {
//   title?: string;
// }

export interface GetConfigState {
  appKey?: string;
}

export interface GetApiDataState {
  appKey: string;
}
