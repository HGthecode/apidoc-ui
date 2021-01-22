import { sendRequest } from "@/utils/request";

export const url = {
  config: "/apidoc/config",
  data: "/apidoc/data",
  auth: "/apidoc/auth"
};

export const getConfig = param => {
  return sendRequest(url.config, param, "get");
};
export const getData = param => {
  return sendRequest(url.data, param, "get");
};
export const verifyAuth = param => {
  return sendRequest(url.auth, param, "post");
};