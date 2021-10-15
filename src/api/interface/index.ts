import { Method } from "axios";
/**
 * 统一响应体
 */
export interface HttpResponse<T = any> {
  status: number;
  statusText: string;
  data: {
    code: number;
    desc: string;
    data: T;
    [key: string]: any;
  };
}

export interface ApiOptionState {
  [key: string]: ApiOptionItemState;
}

export interface ApiOptionItemState {
  url: string;
  method: Method;
  checkToken?: boolean;
}

export interface GetMdMenusState {
  appKey?: string;
}

export interface GetMdDetailState {
  appKey: string;
  path: string;
}

/**
 * 验证访问权限
 */
export interface CheckAuthState {
  appKey: string;
  password: string;
}

/**
 * 验证访问权限
 */
export interface CheckAuthResponse {
  token: string;
}
