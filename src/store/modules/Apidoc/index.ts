import { Module } from 'vuex'
import { GlobalState, IAxiosResponseData } from '../../index'
import * as Types from './types'
import { ApidocState } from './interface'
import * as API from './api'

const state: ApidocState = {
  docs:[],
  groups: [],
  list: [],
  tags: [],
}


const apidoc: Module<ApidocState, GlobalState> = {
  namespaced: true,
  state,
  actions: {
    // 获取api文档数据
    async [Types.GET_API_DATA]({ commit },params) {
      const result = await API.getApiData(params)
      if (result.data && result.data.code !== 0) return
      commit(Types.SET_API_DATA, result.data)
    },
    
  },
  mutations: {
    // 设置配置信息
    [Types.SET_API_DATA](state, data: ApidocState) {
      state.docs = data.docs
      state.groups = data.groups
      state.list = data.list
      state.tags = data.tags
    },
    
  }
}

export default apidoc
