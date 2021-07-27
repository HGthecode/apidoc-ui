<template>
  <div
    :class="['layout-content', { mobile: isMobile }]"
    :style="{ marginLeft: `${sideWidth + 2}px` }"
  >
    <router-view v-slot="{ Component }">
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

export default defineComponent({
  components: {},
  setup() {
    let store = useStore<GlobalState>();
    // const keepAlivePages: string[] = [];
    const state = reactive({
      sideWidth: computed(() => store.state.app.sideWidth),
      pageData: computed(() => store.state.app.pageData),
      keepAlivePages: computed(() => store.getters["app/keepAliveKeys"]),
      isMobile: computed(() => store.state.app.isMobile),
    });

    // 解析路由 key
    function parseRouteKey(route: RouteLocationNormalizedLoaded): string {
      let key = route.fullPath;
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
