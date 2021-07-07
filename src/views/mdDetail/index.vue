<template>
  <div>
    {{ detail }}
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, toRefs, watch } from "vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import { useRoute } from "vue-router";
import { onBeforeRouteUpdate, RouteLocationNormalized } from "vue-router";
import { getMdDetail } from "@/api";
import { createMdPageKey } from "@/utils";
import * as Types from "@/store/modules/App/types";

export default defineComponent({
  components: {},
  setup(props) {
    const route = useRoute();
    let store = useStore<GlobalState>();

    const state = reactive({
      appKey: computed(() => store.state.app.appKey),
      pageData: computed(() => store.state.app.pageData),
      detail: {},
    });
    // console.log("-----", state.pageData);
    const fetchData = () => {
      const { query, params } = route;
      const key = createMdPageKey({
        appKey: query.appKey as string,
        path: query.path as string,
      });
      if (state.pageData[key] && (state.pageData[key].mdDetail as string)) {
        state.detail = state.pageData[key];
      } else if (query.path && state.appKey) {
        getMdDetail({
          appKey: state.appKey,
          path: query.path as string,
        }).then((res) => {
          console.log(res);
          store.dispatch(`app/${Types.ADD_PAGE_DATA}`, {
            ...state.pageData[key],
            mdDetail: res.data.data as string,
            appKey: state.appKey,
            key,
          });
          state.detail = state.pageData[key];
        });
      }
    };
    fetchData();

    // onBeforeRouteUpdate((to: RouteLocationNormalized) => {
    //   if (to.name === "MdDetail") {
    //     fetchData();
    //   }
    // });

    watch(
      () => route.fullPath,
      () => {
        if (route.name === "MdDetail") {
          fetchData();
        }
      }
    );

    return { ...toRefs(state) };
  },
});
</script>
