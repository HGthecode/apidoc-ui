import { createStore } from 'vuex'
import { AppState } from './modules/App/interface'
import { ApidocState } from './modules/Apidoc/interface'

// import { IIndexState } from './modules/Login/interface'
import app from './modules/App'
import apidoc from './modules/Apidoc'

// import login from './modules/Login'

// 全局状态
export interface GlobalState {
  app: AppState,
  apidoc:ApidocState
  // login: IIndexState
}

// 后台接口返回参数类
export interface IAxiosResponseData {
  code: number,
  data: any,
  message: string
}

const store = createStore<GlobalState>({
  mutations: {
  },
  actions: {
  },
  modules: {
    app,
    apidoc
    // login
  }
})

export default store
