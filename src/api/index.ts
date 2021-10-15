import Axios from "@/utils/http/index";
import { HttpResponse, CheckAuthState, CheckAuthResponse } from "./interface";
import { ConfigInfo, GetConfigState } from "./interface/config";
import { GetApiDataState, ApiDataInfo } from "./interface/apiData";
import { MdMenuItem, GetMdMenusState, GetMdDetailState, MdDetail } from "./interface/markdown";
import Apis from "./apis";

export const getConfigInfo = (params: GetConfigState): Promise<HttpResponse<ConfigInfo>> => {
  return Axios(Apis.GET_CONFIG.url, {
    method: Apis.GET_CONFIG.method,
    params: {
      ...params,
    },
  });
};

export const getApiData = (params: GetApiDataState): Promise<HttpResponse<ApiDataInfo>> => {
  return Axios(Apis.GET_API_DATA.url, {
    method: Apis.GET_API_DATA.method,
    params: {
      ...params,
    },
  });
};

export const getMdMenus = (params: GetMdMenusState): Promise<HttpResponse<MdMenuItem[]>> => {
  return Axios(Apis.GET_MD_MENUS.url, {
    method: Apis.GET_MD_MENUS.method,
    params: {
      ...params,
    },
  });
};

export const getMdDetail = (params: GetMdDetailState): Promise<HttpResponse<MdDetail>> => {
  return Axios(Apis.GET_MD_DETAIL.url, {
    method: Apis.GET_MD_DETAIL.method,
    params: {
      ...params,
    },
  });
};

export const checkAuth = (params: CheckAuthState): Promise<HttpResponse<CheckAuthResponse>> => {
  return Axios(Apis.VERIFY_AUTH.url, {
    method: Apis.VERIFY_AUTH.method,
    params: {
      ...params,
    },
  });
};
