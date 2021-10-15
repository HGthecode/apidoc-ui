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
  apiDetailInitState?: boolean;
}

export type PageDataItemState = ApiItem;

export interface AddPageDataState extends PageDataItemState {
  key?: string;
}

export interface PageDataState {
  [key: string]: PageDataItemState;
}

export interface FeConfigState {
  TITLE?: string;
  CACHE?: FeConfigCecheState;
  LANG?: FeConfigLangState[];
  HTTP: FeConfigHTTPState;
  PUBLICPATH?: string;
}

export interface FeConfigLangState {
  title: string;
  lang: string;
  messages: FeConfigLangMessage;
}

export interface FeConfigHTTPState {
  TIMEOUT?: number;
  HOSTS?: FeConfigHttpHosts[];
}

export interface FeConfigHttpHosts {
  title: string;
  host: string;
}

export interface FeConfigLangMessage {
  [key: string]: string;
}

export interface FeConfigCecheState {
  PREFIX: string;
}

export interface GetConfigState {
  appKey?: string;
}

export interface GetApiDataState {
  appKey: string;
}
