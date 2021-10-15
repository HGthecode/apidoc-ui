import { MenuItemType } from "@/components/Menu/src/interface";
import { ApiItem } from "@/api/interface/apiData";
import { ConfigGlobalParamItem } from "@/api/interface/config";
import { ConfigAppItem } from "@/api/interface/config";

export interface HttpResponse {
  status: number;
  statusText: string;
  data: {
    code: number;
    desc: string;
    [key: string]: any;
  };
}

export interface GetApiDataState {
  appKey?: string;
}

export interface PageDataState {
  [key: string]: ApiItem;
}

export interface ApidocState {
  groups: GroupItem[];
  data: ApiItem[];
  tags: string[];
  mdMenus: MdMenuItemState[];
  apiMenus: MenuItemType[];
  apiList: ApiItem[];
  apiObject: ApiObjectState;
  globalParams: GlobalParamsState;
  authData: AuthDataState;
  apiAnalysis: ApiAnalysisData;
  currentApp: ConfigAppItem;
  isReload: boolean;
}

export interface ApiAnalysisData {
  apiCount: number;
  apiMethodTotal: ObjectType;
  controllerGroupTotal: ObjectType;
  apiGroupTotal: ObjectType;
  apiTagTotal: ObjectType;
  apiAuthorTotal: ObjectType;
  docsCount?: number;
  appCount?: number;
}

export interface AuthDataState {
  [key: string]: string;
}
export interface GlobalParamsState {
  headers: ConfigGlobalParamItem[];
  params: ConfigGlobalParamItem[];
}

export interface ApiObjectState {
  [key: string]: ApiItem;
}

export interface DocsItem {
  menu_key: string;
  path: string;
  title: string;
  type: string;
}

export interface GroupItem {
  title: string;
  name: string;
  items: ApiItem[];
}

export interface GetMdMenusState {
  appKey?: string;
}

export interface MdMenuItemState {
  menu_key: string;
  title: string;
  path: string;
  type?: string;
}

export interface GetMdDetailState {
  appKey: string;
  path: string;
}
