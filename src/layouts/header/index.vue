<template>
  <div class="layout-header">
    <div class="layout-header_left">
      <logo />
    </div>
    <div class="layout-header_right">menus</div>
    <a-button type="primary">按钮</a-button>
  </div>
</template>

<script lang="ts">
import { Button } from "ant-design-vue";
import { defineComponent } from "vue";
import Logo from "./Logo.vue";
export default defineComponent({
  components: {
    Logo,
    [Button.name]: Button,
  },
});
</script>

<style lang="less">
@import "./index.less";
</style>
