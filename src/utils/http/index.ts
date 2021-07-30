import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { FeConfigState } from "../../store/modules/App/interface";
import Apis from "@/api/apis";
import Cache from "@/utils/cache";
import { AUTH_DATA } from "@/store/modules/Apidoc/types";

let checkToeknUrls = Object.keys(Apis)
  .map((key: string) => {
    const item = Apis[key];
    if (item.checkToken) {
      return item.url;
    }
    return "";
  })
  .filter((p) => p != "");

let apidocConfig: FeConfigState = {};

if (localStorage.APIDOC_CONFIG) {
  apidocConfig = JSON.parse(localStorage.APIDOC_CONFIG);
}

const service = axios.create({
  baseURL: "/",
  timeout: apidocConfig.HTTP && apidocConfig.HTTP.TIMEOUT ? apidocConfig.HTTP.TIMEOUT : 30000,
});

// 请求拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 重置host
    if (localStorage.APIDOC_CONFIG) {
      const apidocConfig: FeConfigState = JSON.parse(localStorage.APIDOC_CONFIG);
      if (apidocConfig.HOST) {
        config.baseURL = apidocConfig.HOST;
      }
    }

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
    const status = response.status;
    let msg = "";
    if (status < 200 || status >= 300) {
      // 处理http错误，抛到业务代码
      msg = "";
      if (typeof response.data === "string") {
        response.data = { msg };
      } else {
        response.data.msg = msg;
      }
    }
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
