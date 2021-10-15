/**
 * 获取md文档菜单请求参数
 */
export interface GetMdMenusState {
  appKey?: string;
  lang?: string;
}

/**
 * 获取md详情请求参数
 */
export interface GetMdDetailState {
  appKey: string;
  path: string;
  lang?: string;
}

/**
 * 获取md菜单请求响应菜单内容
 */
export interface MdMenuItem {
  menu_key: string;
  path: string;
  title: string;
  type: string;
  children?: MdMenuItem[];
}

export interface MdDetail {
  content: string;
}
