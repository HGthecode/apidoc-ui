import { Module } from "vuex";
import { GlobalState } from "../../index";
import * as Types from "./types";
import {
  ApidocState,
  MdMenuItemState,
  ApiObjectState,
  GlobalParamsState,
  AuthDataState,
  ApiAnalysisData,
} from "./interface";
import * as API from "@/api";
import { handleApiData, handleMdMenusData } from "./helper";
import { GetApiDataState, ApiItem } from "@/api/interface/apiData";
import { MenuItemType } from "@/components/Menu/src/interface";
import Cache from "@/utils/cache";
import { ConfigAppItem, ConfigInfo } from "@/api/interface/config";
import { cloneDeep } from "lodash";

const state: ApidocState = {
  groups: [],
  data: [],
  tags: [],
  mdMenus: [],
  apiMenus: [],
  apiList: [],
  apiObject: {},
  globalParams: {
    headers: [],
    params: [],
  },
  authData: {},
  apiAnalysis: {
    apiCount: 0,
    apiMethodTotal: {},
    controllerGroupTotal: {},
    apiGroupTotal: {},
    apiTagTotal: {},
    apiAuthorTotal: {},
    docsCount: 0,
    appCount: 0,
  },
  currentApp: {
    folder: "",
    path: "",
    title: "",
  },
  isReload: false,
};

const apidoc: Module<ApidocState, GlobalState> = {
  namespaced: true,
  state,
  actions: {
    // 获取api文档数据
    [Types.GET_API_DATA]({ commit }, params: GetApiDataState) {
      return new Promise((resolve, reject) => {
        API.getApiData(params)
          .then((res) => {
            const { apiList, apiMenus, apiObject, apiAnalysis } = handleApiData(
              res.data.data,
              params.appKey
            );
            commit(Types.SET_API_LIST, apiList);
            commit(Types.SET_API_OBJECT, apiObject);
            commit(Types.SET_API_MENUS, apiMenus);
            commit(Types.SET_API_TAGS, res.data.data.tags);
            commit(Types.SET_API_ANALYSIS, apiAnalysis);
            commit(Types.SET_CURRENT_APP, res.data.data.app);
            // commit(Types.SET_API_DATA, res.data.data);
            resolve(res.data.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    // 获取md文档数据
    [Types.GET_MD_MENUS]({ commit }, params) {
      return new Promise((resolve, reject) => {
        API.getMdMenus(params)
          .then((res) => {
            const { menus, count } = handleMdMenusData(res.data.data);
            const apiAnalysis = {
              ...state.apiAnalysis,
              docsCount: count,
            };
            commit(Types.SET_API_ANALYSIS, apiAnalysis);
            commit(Types.GET_MD_MENUS, menus);
            resolve(res.data.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    // 设置全局参数
    [Types.SET_GLOBAL_PARAMS]({ commit }, data: GlobalParamsState) {
      Cache.set(Types.GLOBAL_PARAMS, data);
      commit(Types.SET_GLOBAL_PARAMS, data);
    },
    // // 初始化全局参数
    // [Types.INIT_GLOBAL_PARAMS]({ commit }, config: ConfigInfo) {
    //   const cacheGlobalParams = Cache.get(Types.GLOBAL_PARAMS);
    //   const globalParams = {
    //     header: config.headers && config.headers.length ? cloneDeep(config.headers) : [],
    //     params: config.parameters && config.parameters.length ? cloneDeep(config.parameters) : [],
    //   };
    //   if (cacheGlobalParams && cacheGlobalParams.header && cacheGlobalParams.header.length) {
    //     const headerNames = globalParams.header.map((p: any) => p.name);
    //     for (let i = 0; i < cacheGlobalParams.header.length; i++) {
    //       const item = cacheGlobalParams.header[i];
    //       const findIndex = headerNames.indexOf(item.name);
    //       if (findIndex > -1) {
    //         if (item.value) {
    //           globalParams.header[findIndex] = item;
    //         }
    //       } else {
    //         globalParams.header.push(item);
    //       }
    //     }
    //   }
    //   if (cacheGlobalParams && cacheGlobalParams.params && cacheGlobalParams.params.length) {
    //     const paramsNames = globalParams.params.map((p: any) => p.name);
    //     for (let i = 0; i < cacheGlobalParams.params.length; i++) {
    //       const item = cacheGlobalParams.params[i];
    //       const findIndex = paramsNames.indexOf(item.name);
    //       if (findIndex > -1) {
    //         if (item.value) {
    //           globalParams.params[findIndex] = item;
    //         }
    //       } else {
    //         globalParams.params.push(item);
    //       }
    //     }
    //   }
    //   Cache.set(Types.GLOBAL_PARAMS, globalParams);
    //   commit(Types.SET_GLOBAL_PARAMS, globalParams);
    // },
    // 设置权限token
    [Types.SET_AUTH_DATA]({ commit }, data: AuthDataState) {
      Cache.set(Types.AUTH_DATA, data);
      commit(Types.SET_AUTH_DATA, data);
    },
    // 设置api分析数据
    [Types.SET_API_ANALYSIS]({ commit }, data: ApiAnalysisData) {
      commit(Types.SET_API_ANALYSIS, data);
    },
    // 设置isreload值
    [Types.SET_ISRELOAD]({ commit }, flag: boolean) {
      commit(Types.SET_ISRELOAD, flag);
    },
  },
  mutations: {
    // 设置api数据
    [Types.SET_API_DATA](state, data: ApidocState) {
      state.groups = data.groups;
      state.data = data.data;
      state.tags = data.tags;
    },
    // 设置md菜单数据
    [Types.GET_MD_MENUS](state, data: MdMenuItemState[]) {
      state.mdMenus = data;
    },

    // 设置api接口数据列表
    [Types.SET_API_LIST](state, data: ApiItem[]) {
      state.apiList = data;
    },
    // 设置api接口数据对象
    [Types.SET_API_OBJECT](state, data: ApiObjectState) {
      state.apiObject = data;
    },
    // 设置api接口数据列表
    [Types.SET_API_MENUS](state, data: MenuItemType[]) {
      state.apiMenus = data;
    },
    // 设置可选的tags
    [Types.SET_API_TAGS](state, tags: string[]) {
      state.tags = tags;
    },
    // 设置全局参数
    [Types.SET_GLOBAL_PARAMS](state, data: GlobalParamsState) {
      state.globalParams = data;
    },
    // 设置权限token
    [Types.SET_AUTH_DATA](state, data: AuthDataState) {
      state.authData = data;
    },
    // 设置api分析数据
    [Types.SET_API_ANALYSIS](state, data: ApiAnalysisData) {
      state.apiAnalysis = { ...state.apiAnalysis, ...data };
    },
    // 设置当前app的参数
    [Types.SET_CURRENT_APP](state, data: ConfigAppItem) {
      state.currentApp = data;
    },
    // 设置isreload值
    [Types.SET_ISRELOAD](state, flag: boolean) {
      state.isReload = flag;
    },
  },
};

export default apidoc;
