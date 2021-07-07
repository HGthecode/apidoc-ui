<template>
  <div class="layout-header">
    <div class="layout-header_left">
      <logo />
    </div>
    <div class="layout-header_right">
      <dark-switch />
      <!-- <app-select /> -->
      <menus />
    </div>
  </div>
</template>

<script lang="ts">
import { Button, Switch } from "ant-design-vue";
import { defineComponent } from "vue";
import Logo from "./Logo.vue";
import Menus from "./Menu.vue";
import DarkSwitch from "./DarkSwitch.vue";
// import AppSelect from './AppSelect.vue';

export default defineComponent({
  components: {
    Logo,
    Menus,
    DarkSwitch,
    // AppSelect,
    [Button.name]: Button,
    [Switch.name]: Switch,
  },
});
</script>

<style lang="less">
@import "./index.less";
</style>
