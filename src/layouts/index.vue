<template>
  <div class="layout-container">
    <layout-header />
    <a-spin :spinning="loading" style="height: 500px">
      <layout-sider />
      <layout-multitabs />
      <layout-content />
    </a-spin>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, computed, toRefs, watch } from "vue";
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

export default defineComponent({
  components: {
    LayoutHeader,
    LayoutContent,
    LayoutSider,
    LayoutMultitabs,

    [Spin.name]: Spin,
  },
  setup() {
    let store = useStore<GlobalState>();
    const route = useRoute();
    // const router = useRouter();

    const state = reactive({
      appKey: computed(() => store.state.app.appKey),
      loading: false,
    });

    const fetchApiData = (appKey: string) => {
      state.loading = true;
      // setAppKey(appKey);
      store
        .dispatch(`apidoc/${ApidocTypes.GET_API_DATA}`, {
          appKey,
        })
        .then((res) => {
          // console.log(res.data);

          state.loading = false;
        })
        .catch((err) => {
          state.loading = false;
        });

      store.dispatch(`apidoc/${ApidocTypes.GET_MD_DATA}`, {
        appKey,
      });
    };

    // const setAppKey = (appKey: string) => {
    //   store.dispatch(`app/${Types.SET_APP_KEY}`, appKey);
    // };

    store.dispatch(`app/${Types.GET_CONFIG_INFO}`).then((res) => {
      const appKey: string = route.query.appKey as string;
      if (appKey) {
        store.dispatch(`app/${Types.SET_APP_KEY}`, appKey);
        // fetchApiData(appKey);
      } else if (res.apps && res.apps.length) {
        const treeFirstNode = getFirstNode(res.apps, "items");
        if (treeFirstNode && treeFirstNode.length) {
          const appKey = treeFirstNode.map((p) => p.folder).join("_");
          // router.push({
          //   name: "ApiDetail",
          //   query: {
          //     appKey,
          //   },
          // });
          store.dispatch(`app/${Types.SET_APP_KEY}`, appKey);
          // fetchApiData(appKey);
        }
      }
    });

    watch(
      () => state.appKey,
      () => {
        state.appKey && fetchApiData(state.appKey);
      }
    );

    // watch(
    //   () => route.query.appKey,
    //   () => {
    //     const appKey: string = route.query.appKey as string;
    //     console.log(appKey, state.appKey);
    //     if (appKey && appKey != state.appKey) {
    //       fetchApiData(appKey);
    //     }
    //   }
    // );

    return { ...toRefs(state) };
  },
});
</script>
<style lang="less" scoped>
.layout-container {
  padding-top: 45px;
}
</style>
