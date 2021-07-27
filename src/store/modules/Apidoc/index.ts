import { Module } from "vuex";
import { GlobalState } from "../../index";
import * as Types from "./types";
import {
  ApidocState,
  MdMenuItemState,
  ApiObjectState,
  GlobalParamsState,
  AuthDataState,
} from "./interface";
import * as API from "@/api";
import { handleApiData } from "./helper";
import { GetApiDataState, ApiItem } from "@/api/interface/apiData";
import { MenuItemType } from "@/components/Menu/src/interface";
import Cache from "@/utils/cache";

const state: ApidocState = {
  groups: [],
  data: [],
  tags: [],
  mdMenus: [],
  apiMenus: [],
  apiList: [],
  apiObject: {},
  globalParams: {
    header: [],
    params: [],
  },
  authData: {},
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
            const { apiList, apiMenus, apiObject } = handleApiData(res.data.data, params.appKey);
            commit(Types.SET_API_LIST, apiList);
            commit(Types.SET_API_OBJECT, apiObject);
            commit(Types.SET_API_MENUS, apiMenus);
            commit(Types.SET_API_TAGS, res.data.data.tags);

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
            commit(Types.GET_MD_MENUS, res.data.data);
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
    // 设置权限token
    [Types.SET_AUTH_DATA]({ commit }, data: AuthDataState) {
      Cache.set(Types.AUTH_DATA, data);
      commit(Types.SET_AUTH_DATA, data);
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
  },
};

export default apidoc;
