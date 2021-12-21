<template>
  <a-menu
    mode="inline"
    :theme="theme"
    :forceSubMenuRender="false"
    :openKeys="openKeys"
    :selectedKeys="selectedKeys"
    @openChange="onOpenChange"
    @select="onSelect"
  >
    <template v-for="item in menuData" :key="item.menu_key">
      <BasicSubMenuItem :item="item" />
    </template>
  </a-menu>
</template>

<script lang="ts">
import { reactive, defineComponent, toRefs, computed, PropType, watchEffect, watch } from "vue";
import { Menu } from "ant-design-vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import BasicSubMenuItem from "./BasicSubMenuItem.vue";
import { MenuItemType } from "./interface";
import { cloneDeep } from "lodash";
import { filterTree, getTreeValueByField, findNode, getTreePath } from "@/utils/helper/treeHelper";
import { useRoute, useRouter } from "vue-router";
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
      type: Array as PropType<MenuItemType[]>,
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
    const route = useRoute();
    const router = useRouter();

    let store = useStore<GlobalState>();
    const openKeys: string[] = [];
    const selectedKeys: string[] = [];

    const state = reactive({
      menuData: props.data,
      feConfig: computed(() => store.state.app.feConfig),
      appKey: computed(() => store.state.app.appKey),
      theme: computed(() => store.state.app.theme),
      isReload: computed(() => store.state.apidoc.isReload),
      openKeys: openKeys,
      openAllKeys: openKeys,
      selectedKeys: selectedKeys,
    });

    // 是否满足过滤条件
    function hasKeyword(item: MenuItemType, keyword?: string, tags: string[] = []): boolean {
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

    const handleMenuData = (data: MenuItemType[], keyword?: string, tags?: string[]) => {
      let menuData = cloneDeep(data);
      if (keyword || tags?.length) {
        menuData = filterTree<MenuItemType>(
          menuData,
          (node: MenuItemType) => {
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

    let init = true;
    watch<MenuItemType[]>(
      () => props.data,
      () => {
        if (state.isReload) {
          setSelectedKey(route.query.key as string);
        } else if (init && (route.query.key || (route.query.path && route.query.path))) {
          const is = setSelectedKey(route.query.key as string);
          if (!is) {
            router.push({
              name: "Home",
            });
          }
        }
        store.dispatch(`apidoc/${ApidocTypes.SET_ISRELOAD}`, false);
        init = false;
      }
    );
    const setSelectedKey = (key?: string): boolean => {
      const defaultOpenKeys = getTreePath(props.data, (item) => {
        if (
          (key && item.menu_key === key) ||
          (route.query.appKey && route.query.path && route.query.path === item.path)
        ) {
          return true;
        }
        return false;
      });

      if (defaultOpenKeys.length) {
        state.openKeys = defaultOpenKeys;
        state.selectedKeys = [defaultOpenKeys[defaultOpenKeys.length - 1]];
        return true;
      }
      return false;
    };

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
      state.selectedKeys = e.selectedKeys;
      emit("select", e);
    };

    watch(
      () => route.fullPath,
      (v) => {
        console.log(state.selectedKeys, route.query, v);
        if (route.query.key) {
          state.selectedKeys = [route.query.key as string];
        } else {
          state.selectedKeys = [];
        }
      }
    );

    return { ...toRefs(state), onOpenChange, onSelect };
  },
});
</script>
<style lang="less" scoped></style>
