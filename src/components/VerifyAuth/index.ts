// import VerifyAuth from "./Index.vue";

// export default VerifyAuth;

import { createApp } from "vue";
import Modal from "./Index.vue";
function modal(props: any): any {
  return new Promise((resolve, reject) => {
    // 实例化组件，createApp第二个参数是props
    const confirmInstance = createApp(Modal, {
      ...props,
      onSuccess: (res: any) => {
        unmount();
        resolve(res);
      },
      onCancel: () => {
        unmount();
        reject(new Error());
      },
    });
    // 卸载组件
    const unmount = () => {
      confirmInstance.unmount();
      document.body.removeChild(parentNode);
    };
    // 创建一个挂载容器
    const parentNode = document.createElement("div");
    document.body.appendChild(parentNode);
    // 挂载组件
    confirmInstance.mount(parentNode);
  });
}
export default modal;
