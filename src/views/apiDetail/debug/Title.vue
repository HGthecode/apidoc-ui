<template>
  <div class="title flex">
    <h2 class="flex-item">{{ title }}</h2>
    <div>
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
