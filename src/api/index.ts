import Axios from "@/utils/http/index";
import { GetApiDataState, HttpResponse, GetMdMenusState, GetMdDetailState } from "./interface";

export const getConfigInfo = (): Promise<HttpResponse> => {
  return Axios(`/apidoc/config`);
};

export const getApiData = (params: GetApiDataState): Promise<HttpResponse> => {
  return Axios("/apidoc/apiData", {
    method: "get",
    params: {
      ...params,
    },
  });
};

export const getMdMenus = (params: GetMdMenusState): Promise<HttpResponse> => {
  return Axios("/apidoc/mdMenus", {
    method: "get",
    params: {
      ...params,
    },
  });
};

export const getMdDetail = (params: GetMdDetailState): Promise<HttpResponse> => {
  return Axios("/apidoc/mdDetail", {
    method: "get",
    params: {
      ...params,
    },
  });
};
