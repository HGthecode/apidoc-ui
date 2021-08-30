import { ApiOptionState } from "./interface";

const Apis: ApiOptionState = {
  GET_CONFIG: {
    url: "/apidoc/config",
    method: "get",
  },
  GET_API_DATA: {
    url: "/apidoc/apiData",
    method: "get",
    checkToken: true,
  },
  GET_MD_MENUS: {
    url: "/apidoc/mdMenus",
    method: "get",
    checkToken: true,
  },
  GET_MD_DETAIL: {
    url: "/apidoc/mdDetail",
    method: "get",
    checkToken: true,
  },
  VERIFY_AUTH: {
    url: "/apidoc/verifyAuth",
    method: "post",
  },
};

export default Apis;
