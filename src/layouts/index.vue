<template>
  <div v-show="!initLoading" class="layout-container">
    <layout-header @reload="onReload" />
    <error-card
      v-if="
        !loading &&
        ((error.response && error.response.status != 200) || (!error.response && error.message))
      "
      :error="error"
    />
    <a-spin v-else :spinning="loading" style="height: 500px">
      <layout-sider @reload="onReload" />
      <layout-multitabs />
      <layout-content />
    </a-spin>
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
import ErrorCard from "@/components/Error";
import { useLoading } from "@/components/Loading";
import { handleConfigAppsData, handleInitGlobalParams } from "@/store/modules/Apidoc/helper";
import { ThemeEnum } from "@/enums/appEnum";
import { handleApidocHttpError } from "@/utils/http/handleError";

export default defineComponent({
  components: {
    LayoutHeader,
    LayoutContent,
    LayoutSider,
    LayoutMultitabs,
    [Spin.name]: Spin,
    ErrorCard,
  },
  setup() {
    let store = useStore<GlobalState>();
    const route = useRoute();
    const theme = computed(() => store.state.app.theme);
    let initLoading = ref<boolean>(true);
    const error: AxiosError = {
      config: {},
      isAxiosError: false,
      toJSON: () => {
        return {};
      },
      name: "",
      message: "",
    };
    const [openFullLoading, closeFullLoading] = useLoading({
      tip: "加载中...",
      background: theme.value === ThemeEnum.LIGHT ? "#fff" : "#1e1e1e",
    });
    setTimeout(() => {
      openFullLoading();
      initLoading.value = false;
    }, 10);

    const state = reactive({
      appKey: computed(() => store.state.app.appKey),
      apiAnalysis: computed(() => store.state.apidoc.apiAnalysis),
      loading: false,
      error: error,
    });

    const cacheLang = Cache.get("LANG");

    const fetchApiData = (appKey: string, reload?: boolean) => {
      state.loading = true;
      store
        .dispatch(`apidoc/${ApidocTypes.GET_API_DATA}`, {
          appKey,
          reload: reload,
          lang: cacheLang,
        })
        .then(() => {
          state.loading = false;
          closeFullLoading();
        })
        .catch((err: AxiosError) => {
          handleApidocHttpError(err).then((res) => {
            if (res === false) {
              state.error = err;
            } else {
              fetchApiData(state.appKey);
              fetchMdMenus(state.appKey);
            }
          });

          state.loading = false;
          closeFullLoading();
        });
    };

    const fetchMdMenus = (appKey: string): void => {
      store.dispatch(`apidoc/${ApidocTypes.GET_MD_MENUS}`, {
        appKey,
        lang: cacheLang,
      });
    };

    const fetchConfig = () => {
      state.loading = true;
      store
        .dispatch(`app/${Types.GET_CONFIG_INFO}`, { lang: cacheLang })
        .then((res) => {
          // 设置标题
          if (res.title) {
            document.title = res.title;
          }

          // 默认选中的应用
          const appKey: string = route.query.appKey as string;
          if (appKey) {
            store.dispatch(`app/${Types.SET_APP_KEY}`, appKey);
          } else if (res.apps && res.apps.length) {
            const treeFirstNode = getFirstNode(res.apps, "items");
            if (treeFirstNode && treeFirstNode.length) {
              const appKey = treeFirstNode.map((p) => p.folder).join(",");
              store.dispatch(`app/${Types.SET_APP_KEY}`, appKey);
            }
          }
          // 应用总数
          const appData = handleConfigAppsData(res.apps);
          const apiAnalysis = {
            ...state.apiAnalysis,
            appCount: appData.count,
          };
          store.dispatch(`apidoc/${ApidocTypes.SET_API_ANALYSIS}`, apiAnalysis);

          const globalParams = handleInitGlobalParams(res, appData.headers, appData.params);
          store.dispatch(`apidoc/${ApidocTypes.SET_GLOBAL_PARAMS}`, globalParams);
        })
        .catch((err: AxiosError) => {
          state.error = err;
          state.loading = false;
          closeFullLoading();
        });
    };

    fetchConfig();

    const onReload = (tabKey: string) => {
      store.dispatch(`apidoc/${ApidocTypes.SET_ISRELOAD}`, true);
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

    return { ...toRefs(state), onReload, onCheckAuth, initLoading };
  },
});
</script>
<style lang="less" scoped>
.layout-container {
  padding-top: 45px;
}
</style>
