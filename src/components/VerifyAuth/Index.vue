<template>
  <a-modal
    :visible="visible"
    :width="500"
    :destroyOnClose="true"
    :maskClosable="false"
    :title="t('auth.title')"
    @cancel="onCancel"
  >
    <div>
      <a-input-password
        ref="inputRef"
        :placeholder="t('auth.input.placeholder')"
        size="large"
        :allowClear="true"
        v-model:value="password"
        @keydown.enter="handleOk"
      />
    </div>
    <template #footer>
      <a-button type="primary" @click="handleOk">{{ t("common.ok") }}</a-button>
    </template>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, unref } from "vue";
import { Modal, Input, Button, message } from "ant-design-vue";
import useModal from "@/hooks/useModal";
import md5 from "js-md5";
import { checkAuth } from "@/api";
import { getTreePathByKeys } from "@/utils/helper/treeHelper";
import * as ApidocTypes from "@/store/modules/Apidoc/types";
import { useI18n } from "@/hooks/useI18n";
import store from "@/store";

export default defineComponent({
  components: {
    [Modal.name]: Modal,
    [Button.name]: Button,
    [Input.Password.name]: Input.Password,
  },
  props: {
    onSuccess: {
      type: Function,
      default: () => {
        return;
      },
    },
  },
  emits: ["check"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { visible, onShow, onCancel } = useModal();
    const password = ref<string>("");
    const appKey = store.getters["app/appKey"];
    const config = store.getters["app/config"];
    const authData = store.getters["apidoc/authData"];
    const inputRef = ref<HTMLElement | null>(null);

    function handleOk() {
      checkAuth({
        appKey: appKey,
        password: md5(password.value),
      }).then((res) => {
        if (res.data.code !== 0 || !(res.data.data && res.data.data.token)) {
          res.data.msg && message.error(res.data.msg);
          return false;
        }

        const token = res.data.data.token;
        let tokenKey = "global";
        const appKeys = appKey.split(",");
        if (config.apps) {
          const appPath = getTreePathByKeys(
            config.apps,
            appKeys,
            appKeys[0],
            [],
            "folder",
            "items"
          );

          if (appPath && appPath.length) {
            const appConfig = appPath[appPath.length - 1];
            if (appConfig.hasPassword) {
              tokenKey = appKey;
            }
          }
        }
        const json = {
          ...authData,
          [tokenKey]: token,
        };
        store.dispatch(`apidoc/${ApidocTypes.SET_AUTH_DATA}`, json);
        password.value = "";
        props.onSuccess();
      });
    }
    onMounted(() => {
      onShow();
      setTimeout(() => {
        unref(inputRef) && (unref(inputRef) as any).focus();
      }, 500);
    });
    return {
      visible,
      onShow,
      onCancel,
      password,
      handleOk,
      t,
      inputRef,
    };
  },
});
</script>
