<template>
  <div class="layout-content" :style="{ marginLeft: `${sideWidth + 2}px` }">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" :key="parseRouteKey($route)" />
      </keep-alive>
    </router-view>
  </div>
</template>
<script lang="ts">
import { reactive, defineComponent, toRefs, computed } from "vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import { RouteLocationNormalizedLoaded } from "vue-router";
// import LayoutMultitabs from "../multitabs";
// 页面监听钩子

export default defineComponent({
  components: {
    // LayoutMultitabs,
  },
  // computed: {
  //   // 监听子页面钩子
  //   hooks() {
  //     return PAGE_HOOKS.reduce((events: any, hook) => {
  //       events["hook:" + hook] = () => this.pageHook(hook);
  //       return events;
  //     }, {});
  //   },
  // },
  setup() {
    let store = useStore<GlobalState>();
    const state = reactive({
      sideWidth: computed(() => store.state.app.sideWidth),
    });

    // 解析路由 key
    function parseRouteKey(route: RouteLocationNormalizedLoaded): string {
      const defaultKey = route.fullPath;
      if (route.meta.keepKey as string) {
        return route.meta.keepKey + "";
      } else if (typeof route.meta.keepKey === "function") {
        return route.meta.keepKey(route);
      }
      return defaultKey;
    }

    return { ...toRefs(state), parseRouteKey };
  },
});
</script>
<style lang="less" scoped>
@import "./index.less";
</style>
