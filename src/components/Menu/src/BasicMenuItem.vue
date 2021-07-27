<template>
  <a-menu-item :key="item.menu_key">
    <MenuItemContent v-bind="$props" :item="item" />
  </a-menu-item>
</template>

<script lang="ts">
import { reactive, defineComponent, toRefs } from "vue";
import { Menu } from "ant-design-vue";
import MenuItemContent from "./MenuItemContent.vue";

export default defineComponent({
  components: {
    [Menu.Item.name]: Menu.Item,
    MenuItemContent,
  },
  emits: ["mouseUpChange", "mouseMoveChange"],
  props: {
    item: {
      type: Object,
      default: () => {
        return {};
      },
    },
    keyword: {
      type: String,
      default: "",
    },
  },
  setup() {
    const state = reactive({});

    return { ...toRefs(state) };
  },
});
</script>
<style lang="less" scoped></style>
