<template>
  <div class="title flex">
    <h2 class="flex-item">{{ title }}</h2>
    <div class="title-extra">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType } from "vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "Title",
  props: {
    title: {
      type: String as PropType<string>,
      default: "",
    },
  },
});
</script>
<style lang="less" scoped>
.title {
  margin-top: 5px;
  .title-extra {
    line-height: 32px;
  }
}
</style>
