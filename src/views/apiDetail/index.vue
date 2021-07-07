<template>
  <div class="api-page">
    <div class="base-info">
      <h1>{{ detail.title }}</h1>
      <div class="text-list" style="margin-bottom: 10px">
        <div v-if="detail.author" class="text-list-item">
          <span class="text-label">作者：</span>
          <span class="text-value">{{ detail.author }}</span>
        </div>
        <div v-if="detail.tag && detail.tag.length" class="text-list-item">
          <span class="text-label">Tags：</span>
          <span class="text-value">
            <a-tag v-for="(item, index) in detail.tag" :key="index">{{ item }}</a-tag>
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
        <div v-else :class="['api-url-tag', currentMethod]">
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
          <a-tab-pane key="table" tab="文档">
            <table-tab :detail="detail" />
          </a-tab-pane>
          <a-tab-pane key="json" tab="Json">
            <json-tab :detail="detail" />
          </a-tab-pane>
          <a-tab-pane key="debug" tab="调试">
            <debug-tab :detail="detail" />
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, toRefs, watch, ComputedRef } from "vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import { useRoute, onBeforeRouteUpdate, RouteLocationNormalized } from "vue-router";
import { createApiPageKey, copyTextToClipboard } from "@/utils";
import { Tag, Select, message, Tabs } from "ant-design-vue";
import { cloneDeep } from "lodash";
import { CopyOutlined } from "@ant-design/icons-vue";
import { ApiItem } from "../../store/modules/Apidoc/interface";
import TableTab from "./tableTab.vue";
import JsonTab from "./jsonTab.vue";
import DebugTab from "./debugTab.vue";

export default defineComponent({
  name: "ApiDetail",
  components: {
    [Tag.name]: Tag,
    ASelect: Select,
    ASelectOption: Select.Option,
    CopyOutlined,
    [Tabs.name]: Tabs,
    [Tabs.TabPane.name]: Tabs.TabPane,
    TableTab,
    JsonTab,
    DebugTab,
  },
  created() {
    console.log("api page");
  },
  setup(props) {
    const route = useRoute();
    let store = useStore<GlobalState>();
    const detail: ApiItem = {
      menu_key: "",
      children: [],
    };
    const methodList: string[] = [];

    const state = reactive({
      pageData: computed(() => store.state.app.pageData),
      detail: detail,
      currentKey: "",
      methodList: methodList,
      currentMethod: "",
    });
    const fetchData = () => {
      const { query } = route;
      const key = createApiPageKey({
        appKey: query.appKey as string,
        method: query.method as string,
        url: query.url as string,
      });
      state.currentKey = key;
      if (state.pageData[key]) {
        const item = cloneDeep(state.pageData[key]);
        if (item.method && item.method.indexOf(",") > -1) {
          state.methodList = item.method.split(",");
          state.currentMethod = state.methodList[0];
        } else {
          state.currentMethod = item.method as string;
        }
        state.detail = {
          ...item,
        };
      }
    };
    fetchData();

    const onCopyUrl = () => {
      state.detail.url && copyTextToClipboard(state.detail.url);
      message.success("复制成功");
    };

    const onMethodChange = (value: string) => {
      state.currentMethod = value;
    };

    // watch(
    //   () => route.fullPath,
    //   () => {
    //     if (route.name === "ApiDetail") {
    //       fetchData();
    //     }
    //   }
    // );

    watch(
      () => state.pageData[state.currentKey],
      () => {
        fetchData();
      }
    );

    return { ...toRefs(state), onCopyUrl, onMethodChange };
  },
});
</script>
<style lang="less" scoped>
@import "./index.less";
</style>
