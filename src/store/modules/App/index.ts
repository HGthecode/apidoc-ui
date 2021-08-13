import { Module } from "vuex";
import { GlobalState } from "../../index";
import * as Types from "./types";
import {
  AppState,
  FeConfigState,
  PageDataItemState,
  AddPageDataState,
  PageDataState,
} from "./interface";
import { ConfigInfo, GetConfigState } from "@/api/interface/config";
import * as API from "@/api";
import { cloneDeep } from "lodash";
import { ThemeEnum } from "@/enums/appEnum";

const state: AppState = {
  title: "Apidoc",
  theme: ThemeEnum.LIGHT,
  config: {
    title: "",
  },
  feConfig: {
    HOST: "",
  },
  sideWidth: 350,
  appKey: "",
  pageData: {},
  keepAlivePages: [],
  isMobile: false,
  isOpenSide: false,
  apiDetailInitState: undefined,
};

const app: Module<AppState, GlobalState> = {
  namespaced: true,
  state,
  actions: {
    // 获取配置信息
    [Types.GET_CONFIG_INFO]({ commit }, params: GetConfigState) {
      return new Promise((resolve, reject) => {
        API.getConfigInfo({
          ...params,
        })
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
      if (localStorage.APIDOC_CONFIG) {
        const apidocConfig = JSON.parse(localStorage.APIDOC_CONFIG);
        commit(Types.SET_FE_CONFIG, apidocConfig);
      }
    },
    // 设置前端配置
    [Types.SET_FE_CONFIG]({ commit }, data: FeConfigState) {
      localStorage.APIDOC_CONFIG = JSON.stringify(data);
      commit(Types.SET_FE_CONFIG, data);
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
    // 设置缓存页面keys
    [Types.SET_KEEPALIVE_PAGES]({ commit }, data) {
      commit(Types.SET_KEEPALIVE_PAGES, data);
    },
    // 是否是移动端
    [Types.SET_IS_MOBILE]({ commit }, flag) {
      commit(Types.SET_IS_MOBILE, flag);
    },
    // 是否打开侧边菜单-移动端时
    [Types.SET_IS_OPENSIDE]({ commit }, flag) {
      commit(Types.SET_IS_OPENSIDE, flag);
    },
    // api文档加载状态
    [Types.SET_APIDETAIL_INIT_STATE]({ commit }, flag) {
      commit(Types.SET_APIDETAIL_INIT_STATE, flag);
    },
  },
  mutations: {
    // 设置配置信息
    [Types.SET_CONFIG_INFO](state, data: ConfigInfo) {
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
    [Types.SET_APP_THEME](state, theme: ThemeEnum) {
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
      const json = cloneDeep(data);
      delete json.key;
      state.pageData[`${data.key}`] = json;
    },
    // 删除tabs页面数据
    [Types.REMOVE_PAGE_DATA](state, key: string) {
      delete state.pageData[key];
    },
    // 设置缓存页面keys
    [Types.SET_KEEPALIVE_PAGES](state, data: string[]) {
      state.keepAlivePages = data;
    },
    [Types.SET_IS_MOBILE](state, flag: boolean) {
      state.isMobile = flag;
    },
    [Types.SET_IS_OPENSIDE](state, flag: boolean) {
      state.isOpenSide = flag;
    },
    [Types.SET_APIDETAIL_INIT_STATE](state, flag: boolean) {
      state.apiDetailInitState = flag;
    },
  },
  getters: {
    feConfig(state) {
      return state.feConfig;
    },
    keepAliveKeys(state) {
      return ["home"].concat(Object.keys(state.pageData));
    },
  },
};

export default app;
