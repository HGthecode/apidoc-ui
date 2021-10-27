<template>
  <div
    :class="['layout-content', { mobile: isMobile }]"
    :style="{ marginLeft: `${sideWidth + 2}px` }"
  >
    <div v-if="apiDetailInitState === true" class="skeleton-wraper"><Skeleton /></div>

    <router-view v-show="apiDetailInitState !== true" v-slot="{ Component }">
      <transition name="fade-slide" mode="out-in">
        <keep-alive :include="keepAlivePages">
          <component :is="handleComponent(Component, $route)" :key="parseRouteKey($route)" />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>
<script lang="ts">
import { reactive, defineComponent, toRefs, computed, watch, watchEffect } from "vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import { RouteLocationNormalizedLoaded } from "vue-router";
import Skeleton from "@/views/apiDetail/skeleton.vue";
import { replaceKeepAlivePageComma } from "@/utils/index";

export default defineComponent({
  components: {
    Skeleton,
  },
  setup() {
    let store = useStore<GlobalState>();
    // const keepAlivePages: string[] = [];
    const state = reactive({
      sideWidth: computed(() => store.state.app.sideWidth),
      pageData: computed(() => store.state.app.pageData),
      keepAlivePages: computed(() => store.getters["app/keepAliveKeys"]),
      isMobile: computed(() => store.state.app.isMobile),
      apiDetailInitState: computed(() => store.state.app.apiDetailInitState),
    });

    // 解析路由 key
    function parseRouteKey(route: RouteLocationNormalizedLoaded): string {
      let key = replaceKeepAlivePageComma(route.fullPath);

      if (route.meta.keepKey as string) {
        key = route.meta.keepKey + "";
      } else if (typeof route.meta.keepKey === "function") {
        key = route.meta.keepKey(route);
      }
      return key;
    }

    function handleComponent(Component: any, route: RouteLocationNormalizedLoaded) {
      Component.type.name = parseRouteKey(route);
      return Component;
    }

    return { ...toRefs(state), parseRouteKey, handleComponent };
  },
});
</script>
<style lang="less" scoped>
@import "./index.less";
</style>
