import { Module } from "vuex";
import { GlobalState } from "../../index";
import * as Types from "./types";
import { ApidocState, MdMenuItemState } from "./interface";
import * as API from "@/api";

const state: ApidocState = {
  groups: [],
  data: [],
  tags: [],
  pageData: {},
  mdMenus: [],
};

const apidoc: Module<ApidocState, GlobalState> = {
  namespaced: true,
  state,
  actions: {
    // 获取api文档数据
    [Types.GET_API_DATA]({ commit }, params) {
      return new Promise((resolve, reject) => {
        API.getApiData(params)
          .then((res) => {
            commit(Types.SET_API_DATA, res.data.data);
            resolve(res.data.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    // 获取md文档数据
    [Types.GET_MD_DATA]({ commit }, params) {
      return new Promise((resolve, reject) => {
        API.getMdMenus(params)
          .then((res) => {
            commit(Types.GET_MD_DATA, res.data.data);
            resolve(res.data.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
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
    [Types.GET_MD_DATA](state, data: MdMenuItemState[]) {
      state.mdMenus = data;
    },
  },
};

export default apidoc;
