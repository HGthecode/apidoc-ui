import axios from "axios";
import { ls } from "./cache";
import { url } from "@/api/app";
import { message } from "ant-design-vue";

const handleError = error => {
  const handleErrorUrls = [url.crud];
  const requestUrl = error.response.config.url;
  const isHandel = handleErrorUrls.some(itemUrl => {
    if (requestUrl.indexOf(itemUrl) > -1) {
      return true;
    }
    return false;
  });
  if (isHandel) {
    const status = error.response.status;
    const msg =
      error.response.data && error.response.data.message
        ? error.response.data.message
        : status + "请求错误";
    message.error(msg);
  }
};

// 创建实例
const service = axios.create({
  baseURL:
    process.env.NODE_ENV === "development" ? "http://test1.apidoc.com" : "",
  timeout: 1 * 60 * 1000
});
// 请求拦截器
service.interceptors.request.use(
  config => {
    const apiConfig = ls.get("config");
    const token = ls.get("token") || "";
    const headers_key =
      apiConfig && apiConfig.auth && apiConfig.auth.headers_key
        ? apiConfig.auth.headers_key
        : "apidocToken";
    if (
      apiConfig &&
      apiConfig.auth &&
      (apiConfig.auth.with_auth || apiConfig.auth.enable) &&
      config.url === "/apidoc/data"
    ) {
      config.headers[headers_key] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    handleError(error);
    return Promise.reject(error);
  }
);

export const sendRequest = (apiUrl, params, type, headers = {}) => {
  const arr = {
    url: apiUrl,
    method: type,
    headers: headers
  };
  if (type === "get") {
    arr.params = params;
  } else {
    arr.data = params;
  }
  return service(arr);
};

export default service;
