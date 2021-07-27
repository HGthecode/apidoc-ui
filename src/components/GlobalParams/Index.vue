<template>
  <a-button @click="onShow"><GlobalOutlined /><span v-if="!isMobile">全局参数</span></a-button>
  <a-modal
    :visible="visible"
    :width="900"
    :bodyStyle="{ padding: '0 10px 10px' }"
    title="全局参数"
    @cancel="onCancel"
  >
    <a-tabs :activeKey="currentTabKey" @change="onTabChange">
      <a-tab-pane key="header" tab="全局Header">
        <a-alert
          type="info"
          show-icon
          style="margin-bottom: 10px"
          message="发送请求时，所有接口将自动携带以下Header参数"
        ></a-alert>
        <params-table ref="headerTableRef" :data="headerData" />
      </a-tab-pane>
      <a-tab-pane key="params" tab="全局Params">
        <a-alert
          type="info"
          show-icon
          style="margin-bottom: 10px"
          message="发送请求时，所有接口将自动携带以下Params参数；如请求参数中存在，则替换全局参数"
        ></a-alert>
        <params-table ref="paramsTableRef" :data="paramsData" />
      </a-tab-pane>
    </a-tabs>
    <template #footer>
      <a-popconfirm
        title="确认清空以上所有参数吗?"
        ok-text="确认"
        cancel-text="取消"
        @confirm="handleDelete"
      >
        <a-button danger ghost>清空</a-button>
      </a-popconfirm>
      <a-button type="primary" @click="handleOk">确认</a-button>
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
    const store = useStore<GlobalState>();
    const { visible, onShow, onCancel } = useModal();
    const config = computed(() => store.state.app.config);
    const globalParams = computed(() => store.state.apidoc.globalParams);
    const isMobile = computed(() => store.state.app.isMobile);

    const headerData = ref<DataItemType[]>([]);
    const paramsData = ref<DataItemType[]>([]);
    const headerTableRef = ref<HTMLElement | null>(null);
    const paramsTableRef = ref<HTMLElement | null>(null);
    const currentTabKey = ref<TabKeys>("header");

    function handleData(globalParams: GlobalParamsState) {
      if (globalParams.header && globalParams.header.length) {
        headerData.value = globalParams.header.map((item) => {
          return {
            id: createRandKey(),
            name: item.name,
            value: item.value,
            desc: item.desc,
          };
        });
      }

      if (globalParams.params && globalParams.params.length) {
        paramsData.value = globalParams.params.map((item) => {
          return {
            id: createRandKey(),
            name: item.name,
            value: item.value,
            desc: item.desc,
          };
        });
      }
    }

    watchEffect(() => {
      handleData(globalParams.value);
    });
    function handleDelete() {
      if (currentTabKey.value === "header") {
        if (config.value.headers && config.value.headers.length) {
          headerData.value = config.value.headers.map((item) => {
            return {
              id: createRandKey(),
              name: item.name,
              value: item.value,
              desc: item.desc,
            };
          });
        } else {
          headerData.value = [];
        }
      } else if (currentTabKey.value === "params") {
        if (config.value.parameters && config.value.parameters.length) {
          paramsData.value = config.value.parameters.map((item) => {
            return {
              id: createRandKey(),
              name: item.name,
              value: item.value,
              desc: item.desc,
            };
          });
        } else {
          paramsData.value = [];
        }
      }
    }

    function handleOk() {
      const json = {
        header: headerData.value,
        params: paramsData.value,
      };
      if (unref(headerTableRef)) {
        json.header = (unref(headerTableRef) as any).getData();
      }
      if (unref(paramsTableRef)) {
        json.params = (unref(paramsTableRef) as any).getData();
      }
      store.dispatch(`apidoc/${Types.SET_GLOBAL_PARAMS}`, json);
      message.success("设置成功");
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
    };
  },
});
</script>
