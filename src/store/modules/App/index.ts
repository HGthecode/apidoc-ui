import { Module } from "vuex";
import { GlobalState, IAxiosResponseData } from "../../index";
import * as Types from "./types";
import {
  AppState,
  ConfigState,
  FeConfigState,
  PageDataItemState,
  AddPageDataState,
  PageDataState,
} from "./interface";
import * as API from "@/api";

const state: AppState = {
  title: "Apidoc",
  theme: "light",
  config: {
    title: "",
  },
  feConfig: {
    HOST: "",
  },
  sideWidth: 350,
  appKey: "",
  pageData: {},
};

const app: Module<AppState, GlobalState> = {
  namespaced: true,
  state,
  actions: {
    // 获取配置信息
    [Types.GET_CONFIG_INFO]({ commit }) {
      return new Promise((resolve, reject) => {
        API.getConfigInfo()
          .then((res) => {
            commit(Types.SET_CONFIG_INFO, res.data.data);
            resolve(res.data.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    // 获取前端配置
    [Types.GET_FE_CONFIG]({ commit }) {
      if (localStorage.apidocConfig) {
        const apidocConfig = JSON.parse(localStorage.apidocConfig);
        commit(Types.SET_FE_CONFIG, apidocConfig);
      }
    },
    [Types.SET_APP_TITLE]({ commit }, title) {
      commit(Types.SET_APP_TITLE, title);
    },
    // 设置主题
    [Types.SET_APP_THEME]({ commit }, theme) {
      commit(Types.SET_APP_THEME, theme);
      document.getElementsByTagName("body")[0].className = `theme-${theme}`;
    },
    // 设置侧边栏宽度
    [Types.SET_SIDE_WIDTH]({ commit }, width) {
      commit(Types.SET_SIDE_WIDTH, width);
    },
    // 设置侧边栏宽度
    [Types.SET_APP_KEY]({ commit }, key) {
      commit(Types.SET_APP_KEY, key);
    },
    // 设置tabs页面数据
    [Types.SET_PAGE_DATA]({ commit }, data) {
      commit(Types.SET_PAGE_DATA, data);
    },
    // 添加tabs页面数据
    [Types.ADD_PAGE_DATA]({ commit }, data) {
      commit(Types.ADD_PAGE_DATA, data);
    },
    // 删除tabs页面数据
    [Types.REMOVE_PAGE_DATA]({ commit }, data) {
      commit(Types.REMOVE_PAGE_DATA, data);
    },
  },
  mutations: {
    // 设置配置信息
    [Types.SET_CONFIG_INFO](state, data: ConfigState) {
      state.config = data;
    },
    // 设置前端配置信息
    [Types.SET_FE_CONFIG](state, data: FeConfigState) {
      state.feConfig = data;
    },
    // 设置标题
    [Types.SET_APP_TITLE](state, title: string) {
      state.title = title;
    },
    // 设置主题
    [Types.SET_APP_THEME](state, theme: "dark" | "light") {
      state.theme = theme;
    },
    // 设置侧边栏宽度
    [Types.SET_SIDE_WIDTH](state, width: number) {
      state.sideWidth = width;
    },
    // 设置当前appkey
    [Types.SET_APP_KEY](state, key: string) {
      state.appKey = key;
    },
    // 设置tabs页面数据
    [Types.SET_PAGE_DATA](state, data: PageDataState) {
      state.pageData = data;
    },
    // 添加tabs页面数据
    [Types.ADD_PAGE_DATA](state, data: AddPageDataState) {
      state.pageData[`${data.key}`] = data;
    },
    // 删除tabs页面数据
    [Types.REMOVE_PAGE_DATA](state, key: string) {
      delete state.pageData[key];
    },
  },
  getters: {
    feConfig(state) {
      return state.feConfig;
    },
  },
};

export default app;
