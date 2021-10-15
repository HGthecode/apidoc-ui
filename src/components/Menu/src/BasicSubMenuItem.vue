<template>
  <MenuItemGroup v-if="menuHasItems(item)" :title="item.title">
    <template v-for="childrenItem in item.items || []" :key="childrenItem.name">
      <BasicSubMenuItem v-bind="$props" :item="childrenItem" />
    </template>
  </MenuItemGroup>
  <BasicMenuItem v-else-if="!menuHasChildren(item)" v-bind="$props" />

  <SubMenu
    v-else-if="menuHasChildren(item)"
    :key="item.menu_key"
    popupClassName="app-top-menu-popup"
  >
    <template #title>
      <MenuItemContent v-bind="$props" :item="item" />
    </template>

    <template v-for="childrenItem in item.children || []" :key="childrenItem.menu_key">
      <BasicSubMenuItem v-bind="$props" :item="childrenItem" />
    </template>
  </SubMenu>
</template>

<script lang="ts">
import { reactive, defineComponent, toRefs, computed } from "vue";
import { Menu } from "ant-design-vue";
import BasicMenuItem from "./BasicMenuItem.vue";
import MenuItemContent from "./MenuItemContent.vue";
import { MenuItemType, MenuGroupType } from "./interface";

export default defineComponent({
  components: {
    SubMenu: Menu.SubMenu,
    MenuItemGroup: Menu.ItemGroup,
    [Menu.Item.name]: Menu.Item,
    BasicMenuItem,
    MenuItemContent,
  },
  props: {
    item: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  setup() {
    const state = reactive({});

    const menuHasChildren = (menuTreeItem: MenuItemType): boolean => {
      const nodeChildren = menuTreeItem.children as MenuItemType[];
      return nodeChildren && nodeChildren.length > 0;
    };

    const menuHasItems = (menuTreeItem: MenuGroupType): boolean => {
      return menuTreeItem.items && menuTreeItem.items.length > 0;
    };

    return { ...toRefs(state), menuHasChildren, menuHasItems };
  },
});
</script>
<style lang="less" scoped></style>
