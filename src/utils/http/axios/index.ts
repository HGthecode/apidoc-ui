import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { IResponse } from './type'
import { FeConfig } from '/@/store/modules/app/types'
import { getApidocUrls } from '/@/api/index'
import Cache from '/@/utils/cache'
import { APP_AUTH } from '/@/store/modules/app/types'

let apidocUrls: string[] = []

declare const apidocFeConfig: FeConfig

const config: FeConfig = apidocFeConfig as FeConfig
let baseURL = ''
if (config.HTTP.HOSTS && config.HTTP.HOSTS.length) {
  const cacheHost = Cache.get('HOST')
  if (cacheHost) {
    const find = config.HTTP.HOSTS.find((p) => p.host === cacheHost)
    if (find && find.host) {
      baseURL = find.host
    } else {
      baseURL = config.HTTP.HOSTS[0].host
    }
  } else {
    baseURL = config.HTTP.HOSTS[0].host
  }
}

axios.defaults.timeout = config.HTTP.TIMEOUT
// 表示跨域请求时是否需要使用凭证
axios.defaults.withCredentials = config.HTTP.WITHCREDENTIALS

const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseURL,
})

// axios实例拦截请求
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if (!apidocUrls.length) {
      apidocUrls = getApidocUrls()
    }
    if (config && apidocUrls.includes(config.url as string)) {
      const dataKey = config.method == 'get' ? 'params' : 'data'
      let appKey = ''
      if (config[dataKey] && config[dataKey].appKey) {
        appKey = config[dataKey].appKey
      }
      const authData = Cache.get(APP_AUTH)
      let token = ''
      if (authData && authData[appKey]) {
        token = authData[appKey]
      } else if (authData && authData['global']) {
        token = authData['global']
      }
      if (token) {
        if (config[dataKey]) {
          config[dataKey].token = token
        } else {
          config[dataKey] = {
            token,
          }
        }
      }
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  },
)

// axios实例拦截响应
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  // 请求失败
  (error: any) => {
    return Promise.reject(error)
  },
)

const request = <T = any>(config: AxiosRequestConfig): Promise<IResponse<T>> => {
  const conf = config
  return new Promise((resolve, reject) => {
    axiosInstance
      .request<any, AxiosResponse<IResponse>>(conf)
      .then((res: AxiosResponse<IResponse>) => {
        if (conf.url && apidocUrls.includes(conf.url as string)) {
          const { data } = res
          if (data.code != 0) {
            const err: any = res
            err.response = {
              data: data,
            }
            reject(err)
            return
          }
          resolve(data as IResponse<T>)
          return
        }
        resolve(res as any)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

export function get<T = any>(config: AxiosRequestConfig): Promise<IResponse<T>> {
  return request({ ...config, method: 'GET' })
}

export function post<T = any>(config: AxiosRequestConfig): Promise<IResponse<T>> {
  return request({ ...config, method: 'POST' })
}

export default request
export type { AxiosInstance, AxiosResponse }
