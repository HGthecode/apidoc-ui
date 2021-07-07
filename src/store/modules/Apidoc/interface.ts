import { MenuType } from "@/components/Menu/src/types";
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
  // docs: DocsItem[],
  groups: GroupItem[];
  data: ApiItem[];
  tags: string[];
  pageData: PageDataState;
  mdMenus: MdMenuItemState[];
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

export interface ApiItem extends MenuType {
  appKey?: string;
}

export interface GetMdMenusState {
  appKey?: string;
}

export interface MdMenuItemState {
  menu_key: string;
  title: string;
  path: string;
}

export interface GetMdDetailState {
  appKey: string;
  path: string;
}
