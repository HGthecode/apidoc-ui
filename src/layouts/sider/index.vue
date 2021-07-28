<template>
  <div
    :class="['layout-side', { mobile: isMobile, open: isOpenSide }]"
    :style="{ width: `${sideWidth + 2}px` }"
  >
    <div class="layout-side_header">
      <search @search="onSearch" />
    </div>
    <a-tabs :activeKey="activeKey" @change="onTabChange">
      <a-tab-pane key="api" tab="API">
        <div class="layout-side_menus">
          <Menu
            :data="apiMenus"
            :keyword="keyword"
            :tags="tags"
            :toggleOpenAll="openAllMenuFlag"
            @select="onApiMenuSelect"
          />
        </div>
      </a-tab-pane>
      <a-tab-pane key="md" tab="文档">
        <div class="layout-side_menus">
          <Menu
            :data="mdMenus"
            :keyword="keyword"
            :tags="tags"
            :toggleOpenAll="openAllMenuFlag"
            @select="onMdMenuSelect"
          />
        </div>
      </a-tab-pane>
      <template #tabBarExtraContent>
        <a-space>
          <tags-select @change="onTagsChange" />
          <a-tooltip>
            <template #title>
              更新菜单<span v-if="config.cache && config.cache.enable">，并更新缓存</span>
            </template>
            <a-button @click="reloadApiData">
              <template #icon>
                <UndoOutlined />
              </template>
            </a-button>
          </a-tooltip>

          <a-tooltip>
            <template #title>
              {{ openAllMenuFlag ? "收起全部" : "展开全部" }}
            </template>
            <a-button @click="toggleMenuOpen">
              <template #icon>
                <DownOutlined v-if="!openAllMenuFlag" />
                <UpOutlined v-else />
              </template>
            </a-button>
          </a-tooltip>
        </a-space>
      </template>
    </a-tabs>

    <x-drag-line
      v-if="!isMobile"
      :min="250"
      :max="800"
      :value="sideWidth"
      @mouseMoveChange="onDragLineChange"
    />
  </div>
  <div v-if="isOpenSide" class="layout-side_mask" @click="onHideSide"></div>
</template>

<script lang="ts">
import XDragLine from "../../components/XDragLine.vue";
import { reactive, defineComponent, toRefs, computed, watch } from "vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import * as Types from "@/store/modules/App/types";
import Search from "./Search.vue";
import { Tabs, Button, Space, Tooltip } from "ant-design-vue";
import Menu from "../../components/Menu";
import { TagsOutlined, DownOutlined, UpOutlined, UndoOutlined } from "@ant-design/icons-vue";
import TagsSelect from "@/components/TagsSelect";
import { findNode } from "@/utils/helper/treeHelper";
import { useRouter } from "vue-router";
import { createApiPageKey, createMdPageKey } from "@/utils";
import { MdMenuItemState } from "@/store/modules/Apidoc/interface";
import { MenuItemType } from "@/components/Menu/src/interface";

export default defineComponent({
  components: {
    XDragLine,
    Search,
    Menu,
    // TagsOutlined,
    DownOutlined,
    UpOutlined,
    UndoOutlined,
    TagsSelect,
    [Tabs.name]: Tabs,
    [Tabs.TabPane.name]: Tabs.TabPane,
    [Button.name]: Button,
    [Space.name]: Space,
    [Tooltip.name]: Tooltip,
  },
  emits: ["reload"],
  setup(props, { emit }) {
    const router = useRouter();
    let store = useStore<GlobalState>();
    let menuData: MenuItemType[] = [];
    const tags: string[] = [];
    const state = reactive({
      sideWidth: computed(() => store.state.app.sideWidth),
      apiData: computed(() => store.state.apidoc.data),
      apiMenus: computed(() => store.state.apidoc.apiMenus),
      apiGroups: computed(() => store.state.apidoc.groups),
      mdMenus: computed(() => store.state.apidoc.mdMenus),
      appKey: computed(() => store.state.app.appKey),
      pageData: computed(() => store.state.app.pageData),
      config: computed(() => store.state.app.config),
      isMobile: computed(() => store.state.app.isMobile),
      isOpenSide: computed(() => store.state.app.isOpenSide),
      menuData: menuData,
      keyword: "",
      tags: tags,
      openAllMenuFlag: false,
      activeKey: "api",
    });

    const onDragLineChange = (x: number) => {
      store.dispatch(`app/${Types.SET_SIDE_WIDTH}`, x);
    };

    const onSearch = (keyword: string) => {
      state.keyword = keyword;
    };

    const onTagsChange = (tags: string[]) => {
      state.tags = tags;
    };

    const toggleMenuOpen = () => {
      state.openAllMenuFlag = !state.openAllMenuFlag;
    };

    const onApiMenuSelect = (e: any) => {
      const currentNode = findNode<MenuItemType>(state.apiMenus, (node) => {
        if (node.menu_key === e.selectedKeys[0]) {
          return true;
        }
        return false;
      });
      if (currentNode && ["api", "multiple"].includes(currentNode.type)) {
        router.push({
          name: `ApiDetail`,
          query: {
            key: currentNode.key,
          },
          params: {
            title: currentNode.title as string,
          },
        });
      }
      state.isOpenSide && onHideSide();
    };

    const onMdMenuSelect = (e: any) => {
      const currentNode = findNode<MdMenuItemState>(state.mdMenus, (node) => {
        if (node.menu_key === e.selectedKeys[0]) {
          return true;
        }
        return false;
      });
      if (currentNode && currentNode.path) {
        const key = createMdPageKey({
          path: currentNode.path as string,
          appKey: state.appKey,
        });
        if (!state.pageData[key]) {
          store.dispatch(`app/${Types.ADD_PAGE_DATA}`, {
            ...currentNode,
            appKey: state.appKey,
            key,
          });
        }
        router.push({
          name: "MdDetail",
          query: {
            appKey: state.appKey,
            path: currentNode.path,
          },
          params: {
            title: currentNode.title,
          },
        });
      }
      state.isOpenSide && onHideSide();
    };

    const reloadApiData = () => {
      emit("reload", state.activeKey);
    };

    function onTabChange(key: "api" | "md") {
      state.activeKey = key;
    }

    function onHideSide() {
      store.dispatch(`app/${Types.SET_IS_OPENSIDE}`, false);
    }

    return {
      ...toRefs(state),
      onDragLineChange,
      onSearch,
      toggleMenuOpen,
      onTagsChange,
      onApiMenuSelect,
      onMdMenuSelect,
      reloadApiData,
      onTabChange,
      onHideSide,
    };
  },
});
</script>
<style lang="less" scoped>
@import "./index.less";
</style>
