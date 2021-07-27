import { ConfigAppItem } from "./config";

/**
 * 获取api数据接口请求参数
 */
export interface GetApiDataState {
  appKey: string;
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
}
