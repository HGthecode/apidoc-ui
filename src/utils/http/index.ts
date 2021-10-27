import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { FeConfigState } from "../../store/modules/App/interface";
import Apis from "@/api/apis";
import Cache from "@/utils/cache";
import { AUTH_DATA } from "@/store/modules/Apidoc/types";
import { isArray } from "lodash";

let checkToeknUrls = Object.keys(Apis)
  .map((key: string) => {
    const item = Apis[key];
    if (item.checkToken) {
      return item.url;
    }
    return "";
  })
  .filter((p) => p != "");

let apidocConfig: FeConfigState = {
  HTTP: {},
};

let timeout = 30000;
let baseURL = "/";
if (localStorage.APIDOC_CONFIG) {
  apidocConfig = JSON.parse(localStorage.APIDOC_CONFIG);
  if (apidocConfig.HTTP) {
    timeout = apidocConfig.HTTP.TIMEOUT ? apidocConfig.HTTP.TIMEOUT : timeout;
  }
  const cacheHost = Cache.get("HOST");
  if (cacheHost) {
    baseURL = cacheHost;
  } else if (apidocConfig.HTTP && apidocConfig.HTTP.HOSTS && isArray(apidocConfig.HTTP.HOSTS)) {
    baseURL = apidocConfig.HTTP.HOSTS[0] && apidocConfig.HTTP.HOSTS[0].host;
  }
}

const service = axios.create({
  baseURL: baseURL,
  timeout: timeout,
});

// 请求拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 权限验证携带token
    if (config.url && checkToeknUrls.includes(config.url)) {
      const authData = Cache.get(AUTH_DATA);
      let appKey = "";
      if (config.params.appKey) {
        appKey = config.params.appKey;
      } else if (config.data.appKey) {
        appKey = config.data.appKey;
      }
      let token = "";
      if (authData && authData[appKey]) {
        token = authData[appKey];
      } else if (authData && authData["global"]) {
        token = authData["global"];
      }
      if (token) {
        if (config.method == "get") {
          if (config.params) {
            config.params.token = token;
          } else {
            config.params = {
              token,
            };
          }
        } else if (config.method == "post") {
          if (config.data) {
            config.data.token = token;
          } else {
            config.data = {
              token,
            };
          }
        }
      }
    }

    return config;
  },
  (error) => {
    // 错误抛到业务代码
    error.data = {};
    error.data.msg = "服务器异常，请联系管理员！";
    return Promise.resolve(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      console.log("repeated request: " + error.message);
    }
    return Promise.reject(error);
  }
);

export default service;
