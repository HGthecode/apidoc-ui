<template>
  <a-modal
    :visible="visible"
    :width="500"
    :closable="false"
    :destroyOnClose="true"
    :maskClosable="false"
    :title="t('auth.title')"
    @cancel="onCancel"
  >
    <div>
      <a-input-password
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
import { defineComponent, computed, ref, watchEffect, unref } from "vue";
import { Modal, Input, Button, message } from "ant-design-vue";
import useModal from "@/hooks/useModal";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import md5 from "js-md5";
import { checkAuth } from "@/api";
import { getTreePathByKeys } from "@/utils/helper/treeHelper";
import * as ApidocTypes from "@/store/modules/Apidoc/types";
import { useI18n } from "@/hooks/useI18n";

export default defineComponent({
  components: {
    [Modal.name]: Modal,
    [Button.name]: Button,
    [Input.Password.name]: Input.Password,
  },
  emits: ["check"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const store = useStore<GlobalState>();
    const { visible, onShow, onCancel } = useModal();
    const password = ref<string>("");
    const appKey = computed(() => store.state.app.appKey);
    const config = computed(() => store.state.app.config);
    const authData = computed(() => store.state.apidoc.authData);

    function handleOk() {
      checkAuth({
        appKey: appKey.value,
        password: md5(password.value),
      }).then((res) => {
        if (res.data.code !== 0 || !(res.data.data && res.data.data.token)) {
          res.data.msg && message.error(res.data.msg);
          return false;
        }
        const token = res.data.data.token;
        let tokenKey = "global";
        const appKeys = appKey.value.split(",");
        if (config.value.apps) {
          const appPath = getTreePathByKeys(
            config.value.apps,
            appKeys,
            appKeys[0],
            [],
            "folder",
            "items"
          );

          if (appPath && appPath.length) {
            const appConfig = appPath[appPath.length - 1];
            if (appConfig.hasPassword) {
              tokenKey = appKey.value;
            }
          }
        }
        const json = {
          ...authData.value,
          [tokenKey]: token,
        };
        store.dispatch(`apidoc/${ApidocTypes.SET_AUTH_DATA}`, json);
        emit("check");
        password.value = "";
        onCancel();
      });
    }

    return {
      visible,
      onShow,
      onCancel,
      password,
      handleOk,
      t,
    };
  },
});
</script>
