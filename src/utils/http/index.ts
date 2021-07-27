// http.ts
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

const showStatus = (status: number) => {
  let message = "";
  switch (status) {
    case 400:
      message = "请求错误(400)";
      break;
    case 401:
      message = "未授权，请重新登录(401)";
      break;
    case 403:
      message = "拒绝访问(403)";
      break;
    case 404:
      message = "请求出错(404)";
      break;
    case 408:
      message = "请求超时(408)";
      break;
    case 500:
      message = "服务器错误(500)";
      break;
    case 501:
      message = "服务未实现(501)";
      break;
    case 502:
      message = "网络错误(502)";
      break;
    case 503:
      message = "服务不可用(503)";
      break;
    case 504:
      message = "网络超时(504)";
      break;
    case 505:
      message = "HTTP版本不受支持(505)";
      break;
    default:
      message = `连接出错(${status})!`;
  }
  return `${message}，请检查网络或联系管理员！`;
};
let baseUrl = "/";
if (process.env.NODE_ENV === "development") {
  baseUrl = "http://demo.apidoc.com";
} else if (apidocConfig.HOST) {
  baseUrl = apidocConfig.HOST;
}

const service = axios.create({
  // 联调
  // baseURL: process.env.NODE_ENV === 'production' ? `/` : '/api',
  baseURL: baseUrl,
  // headers: {
  //   get: {
  //     "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
  //   },
  //   post: {
  //     "Content-Type": "application/json;charset=utf-8",
  //   },
  // },
  // // 是否跨站点访问控制请求
  // withCredentials: true,
  timeout: 30000,
  // transformRequest: [
  //   (data) => {
  //     data = JSON.stringify(data);
  //     return data;
  //   },
  // ],
  // validateStatus() {
  //   // 使用async-await，处理reject情况较为繁琐，所以全部返回resolve，在业务代码中处理异常
  //   return true;
  // },
  // transformResponse: [
  //   (data) => {
  //     if (typeof data === "string" && data.startsWith("{")) {
  //       data = JSON.parse(data);
  //     }
  //     return data;
  //   },
  // ],
});

// 请求拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    //获取token，并将其添加至请求头中
    // let token = localStorage.getItem('token')
    // if(token){
    //   config.headers.Authorization = `${token}`;
    // }
    // const headers_key = "apidocToken";

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
      msg = showStatus(status);
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
    } else {
      // handle error code
      // 错误抛到业务代码
      // error.data = {};
      // error.data.msg = "请求超时或服务器异常，请检查网络或联系管理员！";
    }
    return Promise.reject(error);
  }
);

export default service;
