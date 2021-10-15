<template>
  <a class="header-logo">
    <img class="header-logo_img" src="../../assets/logo.png" />
    <span v-if="!isMobile" class="header-logo_title">{{ appTitle }}</span>
  </a>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, toRefs } from "vue";

import { useStore } from "vuex";
import { GlobalState } from "@/store";

export default defineComponent({
  setup() {
    let store = useStore<GlobalState>();
    const state = reactive({
      isMobile: computed(() => store.state.app.isMobile),
      feConfig: computed(() => store.state.app.feConfig),
      config: computed(() => store.state.app.config),
    });
    const appTitle = computed(() => {
      if (state.config && state.config.title) {
        return state.config.title;
      } else if (state.feConfig && state.feConfig.TITLE) {
        return state.feConfig.TITLE;
      }
      return "Apidoc";
    });

    return { ...toRefs(state), appTitle };
  },
});
</script>
<style lang="less" scoped>
.header-logo {
  &_img {
    vertical-align: top;
    margin-right: 16px;
    display: inline-block;
  }
  &_title {
    color: var(--text-color);
    font-size: 20px;
    position: relative;
    display: inline-block;
    line-height: 1.2;
  }
}
</style>
