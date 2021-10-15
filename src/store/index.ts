import { createStore } from "vuex";
import { AppState } from "./modules/App/interface";
import { ApidocState } from "./modules/Apidoc/interface";

import app from "./modules/App";
import apidoc from "./modules/Apidoc";

// 全局状态
export interface GlobalState {
  app: AppState;
  apidoc: ApidocState;
}

export interface ObjectState {
  [key: string]: any;
}

const store = createStore<GlobalState>({
  mutations: {},
  actions: {},
  modules: {
    app,
    apidoc,
  },
});

export default store;
