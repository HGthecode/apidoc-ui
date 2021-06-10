import { Module } from 'vuex'
import { GlobalState, IAxiosResponseData } from '../../index'
import * as Types from './types'
import { AppState, ConfigState,FeConfigState } from './interface'
import * as API from './api'

const state: AppState = {
  title:"Apidoc",
  config: {
    title:""
  },
  feConfig:{
    HOST:""
  }
}


const app: Module<AppState, GlobalState> = {
  namespaced: true,
  state,
  actions: {
    // 获取配置信息
    async [Types.GET_CONFIG_INFO]({ commit }) {
      const result = await API.getConfigInfo<IAxiosResponseData>()
      if (result.data && result.data.code !== 0) return
      commit(Types.SET_CONFIG_INFO, result.data)
    },
    // 获取前端配置
    [Types.GET_FE_CONFIG]({ commit }) {
      if(localStorage.apidocConfig){ 
        const apidocConfig = JSON.parse(localStorage.apidocConfig)
        commit(Types.SET_FE_CONFIG,apidocConfig)
      }
    },
   
    [Types.SET_APP_TITLE]({ commit },title) {
      commit(Types.SET_APP_TITLE, title)
    },
    
  },
  mutations: {
    // 设置配置信息
    [Types.SET_CONFIG_INFO](state, data: ConfigState) {
      state.config = data
    },
    // 设置前端配置信息
    [Types.SET_FE_CONFIG](state, data: FeConfigState) {
      state.feConfig = data
    },
    // 设置标题
    [Types.SET_APP_TITLE](state, title: string) {
      state.title = title
    },
    
  },
  getters:{
    feConfig(state){
      return state.feConfig
    }
  }
}

export default app
