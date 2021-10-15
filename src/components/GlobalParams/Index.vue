<template>
  <a-button @click="onShow"
    ><GlobalOutlined /><span v-if="!isMobile">{{ t("globalParam.title") }}</span></a-button
  >
  <a-modal
    :visible="visible"
    :width="900"
    :bodyStyle="{ padding: '0 10px 10px' }"
    :centered="true"
    :title="t('globalParam.title')"
    @cancel="onCancel"
  >
    <a-tabs :activeKey="currentTabKey" @change="onTabChange">
      <a-tab-pane key="headers" :tab="t('globalParam.header')">
        <a-alert
          type="info"
          show-icon
          style="margin-bottom: 10px"
          :message="t('globalParam.header.message')"
        ></a-alert>
        <params-table ref="headerTableRef" :data="headerData" />
      </a-tab-pane>
      <a-tab-pane key="params" :tab="t('globalParam.params')">
        <a-alert
          type="info"
          show-icon
          style="margin-bottom: 10px"
          :message="t('globalParam.params.message')"
        ></a-alert>
        <params-table ref="paramsTableRef" :data="paramsData" />
      </a-tab-pane>
    </a-tabs>
    <template #footer>
      <a-popconfirm
        :title="t('globalParam.cancel.confirm')"
        :ok-text="t('common.ok')"
        :cancel-text="t('common.cancel')"
        @confirm="handleDelete"
      >
        <a-button danger ghost>{{ t("common.clear") }}</a-button>
      </a-popconfirm>
      <a-button type="primary" @click="handleOk">{{ t("common.ok") }}</a-button>
    </template>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watchEffect, unref } from "vue";
import { GlobalOutlined } from "@ant-design/icons-vue";
import { Button, Modal, Tabs, Popconfirm, Alert, message } from "ant-design-vue";
import useModal from "@/hooks/useModal";
import ParamsTable from "./ParamsTable.vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import { DataItemType, TabKeys } from "./interface";
import { ConfigInfo } from "@/api/interface/config";
import * as Types from "@/store/modules/Apidoc/types";
import { GlobalParamsState } from "@/store/modules/Apidoc/interface";
import { createRandKey } from "@/utils";
import { useI18n } from "@/hooks/useI18n";

// import Cache from "@/utils/cache";
// import * as Types from "./types";

export default defineComponent({
  components: {
    GlobalOutlined,
    [Button.name]: Button,
    [Modal.name]: Modal,
    [Tabs.name]: Tabs,
    [Tabs.TabPane.name]: Tabs.TabPane,
    [Popconfirm.name]: Popconfirm,
    [Alert.name]: Alert,
    ParamsTable,
  },
  setup() {
    const { t } = useI18n();
    const store = useStore<GlobalState>();
    const { visible, onShow, onCancel } = useModal();
    const config = computed(() => store.state.app.config);
    const globalParams = computed(() => store.state.apidoc.globalParams);
    const isMobile = computed(() => store.state.app.isMobile);

    const headerData = ref<DataItemType[]>([]);
    const paramsData = ref<DataItemType[]>([]);
    const headerTableRef = ref<HTMLElement | null>(null);
    const paramsTableRef = ref<HTMLElement | null>(null);
    const currentTabKey = ref<TabKeys>("headers");

    function handleData(globalParams: GlobalParamsState) {
      if (globalParams.headers && globalParams.headers.length) {
        headerData.value = globalParams.headers.map((item) => {
          return {
            ...item,
            id: createRandKey(),
            appKey: item.appKey ? item.appKey : "global",
          };
        });
      }

      if (globalParams.params && globalParams.params.length) {
        paramsData.value = globalParams.params.map((item) => {
          return {
            ...item,
            id: createRandKey(),
            appKey: item.appKey ? item.appKey : "global",
          };
        });
      }
    }

    watchEffect(() => {
      handleData(globalParams.value);
    });
    function handleDelete() {
      if (currentTabKey.value === "headers") {
        headerData.value = [];
      } else if (currentTabKey.value === "params") {
        paramsData.value = [];
      }
    }

    function handleOk() {
      const json = {
        headers: headerData.value,
        params: paramsData.value,
      };
      if (unref(headerTableRef)) {
        json.headers = (unref(headerTableRef) as any).getData();
      }
      if (unref(paramsTableRef)) {
        json.params = (unref(paramsTableRef) as any).getData();
      }
      store.dispatch(`apidoc/${Types.SET_GLOBAL_PARAMS}`, json);
      message.success(t("common.setSuccess"));
      onCancel();
    }

    function onTabChange(key: TabKeys) {
      currentTabKey.value = key;
    }

    return {
      visible,
      onShow,
      onCancel,
      handleDelete,
      handleOk,
      headerData,
      paramsData,
      headerTableRef,
      paramsTableRef,
      currentTabKey,
      onTabChange,
      isMobile,
      t,
    };
  },
});
</script>
