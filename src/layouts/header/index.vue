<template>
  <div :class="['layout-header', { mobile: isMobile }]">
    <div class="layout-header_left">
      <span class="layout-header_button" @click="onOpenSideMenu"><MenuOutlined /></span>
      <logo />
    </div>
    <div class="layout-header_right">
      <a-space>
        <dark-switch />
        <global-params />
        <host-select />
      </a-space>
      <!-- <a-button><GlobalOutlined />全局参数</a-button> -->
    </div>
  </div>
</template>

<script lang="ts">
import { Button, Switch, Space } from "ant-design-vue";
import { defineComponent, reactive, computed, toRefs } from "vue";
import Logo from "./Logo.vue";
import DarkSwitch from "./DarkSwitch.vue";
import GlobalParams from "@/components/GlobalParams";
import HostSelect from "@/components/HostSelect";
import { MenuOutlined } from "@ant-design/icons-vue";
import * as Types from "@/store/modules/App/types";

import { useStore } from "vuex";
import { GlobalState } from "@/store";

export default defineComponent({
  components: {
    Logo,
    DarkSwitch,
    [Button.name]: Button,
    [Switch.name]: Switch,
    [Space.name]: Space,
    GlobalParams,
    HostSelect,
    MenuOutlined,
    // GlobalOutlined,
  },
  setup() {
    let store = useStore<GlobalState>();
    // const keepAlivePages: string[] = [];
    const state = reactive({
      isMobile: computed(() => store.state.app.isMobile),
    });

    function onOpenSideMenu() {
      store.dispatch(`app/${Types.SET_IS_OPENSIDE}`, true);
    }

    return { ...toRefs(state), onOpenSideMenu };
  },
});
</script>

<style lang="less">
@import "./index.less";
</style>
