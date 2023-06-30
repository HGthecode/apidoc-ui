import showVerifyAuth from '/@/components/VerifyAuth'
import { FeConfig } from '/@/store/modules/app/types'
import { useAppOutsideStore } from '/@/store/modules/app/index'
// 限制只弹出一次
let isShowVerifyAuth = false
// 暂存待响应的Promise
let resolveList: any = []

declare const apidocFeConfig: FeConfig

const config: FeConfig = apidocFeConfig as FeConfig

const authConfig = {
  ERROR_STATUS: (config.AUTH && config.AUTH.ERROR_STATUS) || 401,
  ERROR_CODE_FIELD: (config.AUTH && config.AUTH.ERROR_CODE_FIELD) || 'code',
}

export function handleApidocHttpError(error: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (error.response || (error.status == 200 && error.data)) {
      let status = 200
      let code = 0
      if (error.response) {
        status = error.response.status
        code = (error.response.data && error.response.data[authConfig.ERROR_CODE_FIELD]) || 0
      } else {
        status = error.status
        code = error.data.code
      }
      if (status === authConfig.ERROR_STATUS || [4001, 4002].includes(code)) {
        if (!isShowVerifyAuth) {
          isShowVerifyAuth = true

          showVerifyAuth({
            onSuccess: (res) => {
              isShowVerifyAuth = false

              if (resolveList.length) {
                for (let i = 0; i < resolveList.length; i++) {
                  const resolveItem = resolveList[i]
                  resolveItem.resolve(res)
                }
              }
              resolveList = []
              resolve(res)
            },
            onCancel: () => {
              isShowVerifyAuth = false
              reject()
            },
          })
        } else {
          resolveList.push({
            resolve: resolve,
            reject: reject,
          })
        }
      } else if (code != 0) {
        const appStore = useAppOutsideStore()
        appStore.setGlobalError(error)
        resolve(false)
      } else {
        // 返回false表示不需处理的
        resolve(false)
      }
    }
  })
}
