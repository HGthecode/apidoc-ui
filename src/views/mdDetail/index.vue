<template>
  <div :class="['md-page', { mobile: isMobile }]" id="mdContainer">
    <div class="md-content-wraper">
      <skeleton v-if="loading" />
      <markdown v-else :md="detail.mdDetail" />
    </div>
    <div v-if="!isMobile && !loading" class="md-anchor-wraper">
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
import Skeleton from "@/views/apiDetail/skeleton.vue";
import { AxiosError } from "axios";
import { handleApidocHttpError } from "@/utils/http/handleError";

export default defineComponent({
  components: {
    Markdown,
    MdAnchor,
    Skeleton,
  },
  setup() {
    const route = useRoute();
    let store = useStore<GlobalState>();

    const state = reactive({
      appKey: computed(() => store.state.app.appKey),
      pageData: computed(() => store.state.app.pageData),
      isMobile: computed(() => store.state.app.isMobile),
      detail: {},
      loading: false,
    });

    const cacheLang = Cache.get("LANG");
    const fetchData = () => {
      state.loading = true;
      const { query, params } = route;
      const key = createMdPageKey({
        appKey: query.appKey as string,
        path: query.path as string,
      });
      let appKey: string = state.appKey as string;
      if (!appKey && query.appKey) {
        appKey = query.appKey as string;
      }

      if (query.path && appKey) {
        getMdDetail({
          appKey: appKey,
          path: query.path as string,
          lang: cacheLang,
        })
          .then((res) => {
            store.dispatch(`app/${Types.ADD_PAGE_DATA}`, {
              ...state.pageData[key],
              mdDetail: res.data.data.content as string,
              appKey: state.appKey,
              key,
            });
            state.detail = state.pageData[key];
            state.loading = false;
          })
          .catch((err: AxiosError) => {
            handleApidocHttpError(err).then(() => {
              fetchData();
            });
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
