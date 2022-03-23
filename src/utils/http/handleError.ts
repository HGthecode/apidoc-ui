import { AxiosError } from "axios";
import showVerifyAuth from "@/components/VerifyAuth";

// 限制只弹出一次
let isShowVerifyAuth = false;
// 暂存待响应的Promise
let resolveList: any = [];

export const handleApidocHttpError = (error: AxiosError): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (error.response) {
      const status = error.response.status;
      const code = error.response.data && error.response.data.code ? error.response.data.code : 0;

      if (status === 401 || [4003, 4004].includes(code)) {
        if (!isShowVerifyAuth) {
          isShowVerifyAuth = true;
          showVerifyAuth({})
            .then((res: any) => {
              isShowVerifyAuth = false;
              if (resolveList.length) {
                for (let i = 0; i < resolveList.length; i++) {
                  const resolveItem = resolveList[i];
                  resolveItem.resolve(res);
                }
              }
              resolve(res);
              resolveList = [];
            })
            .catch(() => {
              isShowVerifyAuth = false;
              reject();
            });
        } else {
          resolveList.push({
            resolve: resolve,
            reject: reject,
          });
        }
      } else {
        // 返回false表示不需处理的
        resolve(false);
      }
    }
  });
};
