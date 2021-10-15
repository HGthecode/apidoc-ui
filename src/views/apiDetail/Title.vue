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
.title-extra {
  // padding-top: 5px;
  line-height: 32px;
}
</style>
