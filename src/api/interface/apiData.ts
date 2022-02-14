import { ConfigAppItem } from "./config";

/**
 * 获取api数据接口请求参数
 */
export interface GetApiDataState {
  appKey: string;
  lang?: string;
}

/**
 * 获取api数据接口响应体
 */
export interface ApiDataInfo {
  app: ConfigAppItem;
  data: ApiItem[];
  tags: string[];
}

export interface ApiItem {
  title: string;
  url?: string;
  method?: string | string[];
  sort?: number;
  menu_key: string;
  group?: string;
  controller?: string;
  tag?: string[];
  children: ApiItem[];
  param?: ParamItem[];
  return?: ParamItem[];
  header?: ParamItem[];
  before?: ApiEventItem[];
  after?: ApiEventItem[];
  author?: string;
}

export interface ParamItem {
  childrenType?: string;
  default?: string;
  desc?: string;
  md?: string;
  mdRef?: string;
  name: string;
  replaceGlobal?: string;
  require?: boolean;
  source?: string;
  type?: string;
  mock?: string;
}

export interface ApiEventItem {
  event: string;
  key?: string;
  value?: string;
  desc?: string;
  url?: string;
  method?: string;
  contentType?: string;
  appKey?: string;
}
