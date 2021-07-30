<template>
  <div :class="['md-page', { mobile: isMobile }]" id="mdContainer">
    <div class="md-content-wraper">
      <markdown :md="detail.mdDetail" />
    </div>
    <div v-if="!isMobile" class="md-anchor-wraper">
      <md-anchor :md="detail.mdDetail" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, toRefs, watch } from "vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import { useRoute } from "vue-router";
import { getMdDetail } from "@/api";
import { createMdPageKey } from "@/utils";
import * as Types from "@/store/modules/App/types";
import Markdown, { MdAnchor } from "@/components/Markdown";
import Cache from "@/utils/cache";

export default defineComponent({
  components: {
    Markdown,
    MdAnchor,
  },
  setup() {
    const route = useRoute();
    let store = useStore<GlobalState>();

    const state = reactive({
      appKey: computed(() => store.state.app.appKey),
      pageData: computed(() => store.state.app.pageData),
      isMobile: computed(() => store.state.app.isMobile),
      detail: {},
    });
    const cacheLang = Cache.get("LANG");
    const fetchData = () => {
      const { query, params } = route;
      const key = createMdPageKey({
        appKey: query.appKey as string,
        path: query.path as string,
      });
      if (query.path && state.appKey) {
        getMdDetail({
          appKey: state.appKey,
          path: query.path as string,
          lang: cacheLang,
        }).then((res) => {
          store.dispatch(`app/${Types.ADD_PAGE_DATA}`, {
            ...state.pageData[key],
            mdDetail: res.data.data.content as string,
            appKey: state.appKey,
            key,
          });
          state.detail = state.pageData[key];
        });
      }
    };
    fetchData();

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
<style lang="less" scoped>
@import "./index.less";
</style>
