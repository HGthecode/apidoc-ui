<template>
  <div class="layout-container">
    <layout-header />
    <a-spin :spinning="loading" style="height: 500px">
      <layout-sider @reload="onReload" />
      <layout-multitabs />
      <layout-content />
    </a-spin>
    <verify-auth ref="verifyAuthRef" @check="onCheckAuth" />
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, computed, toRefs, watch, ref, unref } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import * as Types from "@/store/modules/App/types";
import * as ApidocTypes from "@/store/modules/Apidoc/types";
import LayoutHeader from "./header/index.vue";
import LayoutContent from "./content/index.vue";
import LayoutSider from "./sider/index.vue";
import { getFirstNode } from "@/utils/helper/treeHelper";
import { Spin } from "ant-design-vue";
import LayoutMultitabs from "./multitabs";
import Cache from "@/utils/cache";
import { cloneDeep } from "lodash";
import { AxiosError } from "axios";
import VerifyAuth from "@/components/VerifyAuth";

export default defineComponent({
  components: {
    LayoutHeader,
    LayoutContent,
    LayoutSider,
    LayoutMultitabs,
    [Spin.name]: Spin,
    VerifyAuth,
  },
  setup() {
    let store = useStore<GlobalState>();
    const route = useRoute();
    const verifyAuthRef = ref<HTMLElement | null>(null);

    const state = reactive({
      appKey: computed(() => store.state.app.appKey),
      loading: false,
    });

    const fetchApiData = (appKey: string, reload?: boolean) => {
      state.loading = true;
      store
        .dispatch(`apidoc/${ApidocTypes.GET_API_DATA}`, {
          appKey,
          reload: reload,
        })
        .then(() => {
          state.loading = false;
        })
        .catch((err: AxiosError) => {
          const status = err.response && err.response.status;
          if (status === 401) {
            unref(verifyAuthRef) && (unref(verifyAuthRef) as any).onShow();
          }

          state.loading = false;
        });
    };

    const fetchMdMenus = (appKey: string): void => {
      store.dispatch(`apidoc/${ApidocTypes.GET_MD_MENUS}`, {
        appKey,
      });
    };

    store.dispatch(`app/${Types.GET_CONFIG_INFO}`).then((res) => {
      const appKey: string = route.query.appKey as string;
      if (appKey) {
        store.dispatch(`app/${Types.SET_APP_KEY}`, appKey);
      } else if (res.apps && res.apps.length) {
        const treeFirstNode = getFirstNode(res.apps, "items");
        if (treeFirstNode && treeFirstNode.length) {
          const appKey = treeFirstNode.map((p) => p.folder).join("_");
          store.dispatch(`app/${Types.SET_APP_KEY}`, appKey);
        }
      }
      // 全局参数
      const cacheGlobalParams = Cache.get(ApidocTypes.GLOBAL_PARAMS);
      const globalParams = {
        header: res.headers && res.headers.length ? cloneDeep(res.headers) : [],
        params: res.parameters && res.parameters.length ? cloneDeep(res.parameters) : [],
      };
      if (cacheGlobalParams && cacheGlobalParams.header && cacheGlobalParams.header.length) {
        const headerNames = globalParams.header.map((p: any) => p.name);
        for (let i = 0; i < cacheGlobalParams.header.length; i++) {
          const item = cacheGlobalParams.header[i];
          const findIndex = headerNames.indexOf(item.name);
          if (findIndex > -1) {
            globalParams.header[findIndex] = item;
          } else {
            globalParams.header.push(item);
          }
        }
      }
      if (cacheGlobalParams && cacheGlobalParams.params && cacheGlobalParams.params.length) {
        const paramsNames = globalParams.params.map((p: any) => p.name);
        for (let i = 0; i < cacheGlobalParams.params.length; i++) {
          const item = cacheGlobalParams.params[i];
          const findIndex = paramsNames.indexOf(item.name);
          if (findIndex > -1) {
            globalParams.params[findIndex] = item;
          } else {
            globalParams.params.push(item);
          }
        }
      }
      store.dispatch(`apidoc/${ApidocTypes.SET_GLOBAL_PARAMS}`, globalParams);
    });

    const onReload = (tabKey: string) => {
      if (tabKey === "api") {
        state.appKey && fetchApiData(state.appKey, true);
      } else if (tabKey === "md") {
        state.appKey && fetchMdMenus(state.appKey);
      }
    };
    watch(
      () => state.appKey,
      () => {
        if (state.appKey) {
          fetchApiData(state.appKey);
          fetchMdMenus(state.appKey);
        }
      }
    );

    const onCheckAuth = () => {
      state.appKey && fetchApiData(state.appKey);
    };

    return { ...toRefs(state), onReload, verifyAuthRef, onCheckAuth };
  },
});
</script>
<style lang="less" scoped>
.layout-container {
  padding-top: 45px;
}
</style>
