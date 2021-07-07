<template>
  <a-menu
    mode="inline"
    :forceSubMenuRender="false"
    :openKeys="openKeys"
    @openChange="onOpenChange"
    @select="onSelect"
  >
    <template v-for="item in menuData" :key="item.menu_key">
      <BasicSubMenuItem :item="item" />
    </template>
  </a-menu>
</template>

<script lang="ts">
import { reactive, defineComponent, toRefs, computed, PropType, watchEffect } from "vue";
import { Menu } from "ant-design-vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import BasicSubMenuItem from "./BasicSubMenuItem.vue";
import { MenuType } from "./types";
import { cloneDeep } from "lodash";
import { filterTree, getTreeValueByField, findNode } from "@/utils/helper/treeHelper";
import { useRouter } from "vue-router";
import * as ApidocTypes from "@/store/modules/Apidoc/types";

export default defineComponent({
  components: {
    [Menu.name]: Menu,
    [Menu.ItemGroup.name]: Menu.ItemGroup,
    [Menu.Item.name]: Menu.Item,
    BasicSubMenuItem,
  },
  emits: ["select", "mouseUpChange", "mouseMoveChange"],
  props: {
    data: {
      type: Array as PropType<MenuType[]>,
      default: () => [],
    },
    keyword: {
      type: String,
      default: "",
    },
    tags: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    toggleOpenAll: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    console.log(props.data);
    const router = useRouter();

    let store = useStore<GlobalState>();
    const openKeys: string[] = [];
    const state = reactive({
      menuData: props.data,
      feConfig: computed(() => store.state.app.feConfig),
      appKey: computed(() => store.state.app.appKey),
      openKeys: openKeys,
      openAllKeys: openKeys,
    });

    // 是否满足过滤条件
    function hasKeyword(item: MenuType, keyword?: string, tags: string[] = []): boolean {
      let hasTag = false;
      if (tags.length) {
        hasTag = tags.some((value) => {
          return item.tag && item.tag.indexOf(value) > -1;
        });
      }
      const hasKeyword =
        keyword &&
        ((item.title && item.title.indexOf(keyword) > -1) ||
          (item.url && item.url.indexOf(keyword) > -1));

      if (keyword && tags.length && hasKeyword && hasTag) {
        return true;
      } else if (keyword && !tags.length && hasKeyword) {
        return true;
      } else if (!keyword && tags.length && hasTag) {
        return true;
      }

      return false;
    }

    const handleMenuData = (data: MenuType[], keyword?: string, tags?: string[]) => {
      let menuData = cloneDeep(data);
      if (keyword || tags?.length) {
        menuData = filterTree<MenuType>(
          menuData,
          (node: MenuType) => {
            if (hasKeyword(node, keyword, tags)) {
              return true;
            }
            return false;
          },
          "children"
        );
      }
      state.menuData = menuData;
      state.openAllKeys = [];
    };

    const onOpenChange = (openKeys: string[]) => {
      state.openKeys = openKeys;
    };

    // watch<MenuType[]>(
    //   () => props.data,
    //   (menuData) => {
    //     handleMenuData(menuData);
    //   }
    // );
    const handleOpenAll = (flag: boolean) => {
      if (flag) {
        // 展开
        if (!state.openAllKeys.length && state.menuData.length) {
          state.openAllKeys = getTreeValueByField(state.menuData);
        }
        state.openKeys = state.openAllKeys;
      } else {
        // 收起
        state.openKeys = [];
      }
    };

    watchEffect(() => {
      handleMenuData(props.data, props.keyword, props.tags);
    });
    watchEffect(() => {
      handleOpenAll(props.toggleOpenAll);
    });

    const onSelect = (e: any) => {
      emit("select", e);
    };

    return { ...toRefs(state), onOpenChange, onSelect };
  },
});
</script>
<style lang="less" scoped></style>
