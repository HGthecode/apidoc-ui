<template>
  <div class="api-page">
    <skeleton v-if="loading" />
    <div v-else class="base-info">
      <h1>{{ detail.title }}</h1>
      <div v-if="isReload">
        <a-alert type="info" show-icon>
          <template #message>
            <span>{{ t("apiPage.update.tip") }}，</span>
            <a-button size="small" type="link" @click="onReload">{{
              t("apiPage.update.button")
            }}</a-button>
          </template>
        </a-alert>
      </div>
      <div class="text-list" style="margin-bottom: 10px">
        <div v-if="detail.author" class="text-list-item">
          <span class="text-label">{{ t("apiPage.author") }}：</span>
          <span class="text-value">{{ detail.author }}</span>
        </div>
        <div v-if="detail.tag && detail.tag.length" class="text-list-item">
          <span class="text-label">{{ t("apiPage.tag") }}：</span>
          <span class="text-value">
            <a-tag v-if="detail.tag && typeof detail.tag === 'string'">{{ detail.tag }}</a-tag>
            <a-tag v-else v-for="(item, index) in detail.tag" :key="index">{{ item }}</a-tag>
          </span>
        </div>
      </div>
      <div class="api-url-box">
        <div
          v-if="methodList && methodList.length > 0"
          :class="['api-method-select']"
          :title="currentMethod"
        >
          <a-select :value="currentMethod" style="width: 100%" @change="onMethodChange">
            <a-select-option v-for="item in methodList" :key="item" :value="item">{{
              item
            }}</a-select-option>
          </a-select>
        </div>
        <div v-else :class="['api-url-method', currentMethod]">
          {{ detail.method }}
        </div>
        <div :class="['api-url-input', { 'method-multiple': methodList.length > 0 }]">
          <input v-model="detail.url" readonly />
        </div>
        <div class="api-url-copy" @click="onCopyUrl">
          <CopyOutlined />
        </div>
      </div>

      <div class="api-content">
        <a-tabs>
          <a-tab-pane key="table" :tab="t('apiPage.docs')">
            <table-tab :detail="detail" />
          </a-tab-pane>
          <a-tab-pane key="json" :tab="t('apiPage.json')">
            <json-tab :detail="detail" />
          </a-tab-pane>
          <a-tab-pane key="debug" :tab="t('apiPage.debug')">
            <debug-tab :detail="detail" :currentMethod="currentMethod" />
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, toRefs, watch, onActivated } from "vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import { useRoute } from "vue-router";
import { copyTextToClipboard } from "@/utils";
import { Tag, Select, message, Tabs, Alert, Button } from "ant-design-vue";
import { cloneDeep } from "lodash";
import { CopyOutlined } from "@ant-design/icons-vue";
import { ApiItem } from "@/api/interface/apiData";
import TableTab from "./tableTab.vue";
import JsonTab from "./jsonTab.vue";
import DebugTab from "./debugTab.vue";
import * as Types from "@/store/modules/App/types";
import { PageDataItemState } from "@/store/modules/App/interface";
import Skeleton from "./skeleton.vue";
import { useI18n } from "@/hooks/useI18n";

export default defineComponent({
  name: "ApiDetail",
  components: {
    [Tag.name]: Tag,
    ASelect: Select,
    ASelectOption: Select.Option,
    CopyOutlined,
    [Tabs.name]: Tabs,
    [Tabs.TabPane.name]: Tabs.TabPane,
    [Alert.name]: Alert,
    [Button.name]: Button,
    TableTab,
    JsonTab,
    DebugTab,
    Skeleton,
  },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    let store = useStore<GlobalState>();
    const detail: ApiItem = {
      title: "",
      menu_key: "",
      children: [],
    };
    const methodList: string[] = [];

    const state = reactive({
      pageData: computed(() => store.state.app.pageData),
      apiObject: computed(() => store.state.apidoc.apiObject),
      detail: detail,
      currentKey: "",
      methodList: methodList,
      currentMethod: "",
      loading: false,
      isReload: false,
    });
    const fetchData = () => {
      state.loading = true;
      const { query } = route;
      const fullPath = route.fullPath;
      const key = query.key as string;
      state.currentKey = fullPath;
      let detail: PageDataItemState = {
        title: "",
        menu_key: "",
        children: [],
      };

      if (state.pageData[fullPath]) {
        detail = cloneDeep(state.pageData[fullPath]);
      } else if (state.apiObject[key]) {
        detail = cloneDeep(state.apiObject[key]);
        store.dispatch(`app/${Types.ADD_PAGE_DATA}`, {
          ...detail,
          key: fullPath,
        });
      }
      if (detail.menu_key) {
        const method = detail.method as string;
        if (method && method.indexOf(",") > -1) {
          state.methodList = method.split(",");
          state.currentMethod = state.methodList[0];
        } else {
          state.currentMethod = detail.method as string;
        }
        state.detail = detail;
        state.loading = false;
      }
      store.dispatch(`app/${Types.SET_APIDETAIL_INIT_STATE}`, false);
    };

    state.loading = true;
    fetchData();

    const onCopyUrl = () => {
      state.detail.url && copyTextToClipboard(state.detail.url);
      message.success(t("common.copySuccess"));
    };

    const onMethodChange = (value: string) => {
      state.currentMethod = value;
    };

    watch(
      () => state.apiObject,
      () => {
        if (!(state.detail && state.detail.menu_key)) {
          fetchData();
        }
      }
    );

    onActivated(() => {
      const { query } = route;
      const fullPath = route.fullPath;
      const key = query.key as string;
      const oldData = JSON.stringify({ ...state.pageData[fullPath], menu_key: "" });
      const newData = JSON.stringify({ ...state.apiObject[key], menu_key: "" });
      if (!(state.pageData[fullPath] && state.apiObject[key] && oldData === newData)) {
        state.isReload = true;
      }
    });

    function onReload() {
      state.loading = true;
      const { query } = route;
      const fullPath = route.fullPath;
      const key = query.key as string;
      const detail = cloneDeep(state.apiObject[key]);
      store.dispatch(`app/${Types.ADD_PAGE_DATA}`, {
        ...detail,
        key: fullPath,
      });
      if (detail.menu_key) {
        const method = detail.method as string;
        if (method && method.indexOf(",") > -1) {
          state.methodList = method.split(",");
          state.currentMethod = state.methodList[0];
        } else {
          state.currentMethod = detail.method as string;
        }
        state.detail = detail;
        state.loading = false;
        state.isReload = false;
      }
    }

    return { ...toRefs(state), onCopyUrl, onMethodChange, onReload, t };
  },
});
</script>
<style lang="less" scoped>
@import "./index.less";
</style>
