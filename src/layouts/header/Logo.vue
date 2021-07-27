<template>
  <a class="header-logo">
    <img class="header-logo_img" src="../../assets/logo.png" />
    <span v-if="!isMobile" class="header-logo_title">Apidoc</span>
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
    });

    return { ...toRefs(state) };
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
