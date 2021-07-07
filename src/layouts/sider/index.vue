<template>
  <div class="layout-side" :style="{ width: `${sideWidth + 2}px` }">
    <div class="layout-side_header">
      <search @search="onSearch" />
    </div>
    <a-tabs>
      <a-tab-pane key="api" tab="API">
        <div class="layout-side_menus">
          <Menu
            :data="menuData"
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

    <x-drag-line :min="250" :max="800" :value="sideWidth" @mouseMoveChange="onDragLineChange" />
  </div>
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
import { MenuType, MenuGroupType } from "@/components/Menu/src/types";
import { TagsOutlined, DownOutlined, UpOutlined } from "@ant-design/icons-vue";
import TagsSelect from "@/components/TagsSelect";
import { findNode } from "@/utils/helper/treeHelper";
import { useRouter } from "vue-router";
import { createApiPageKey, createMdPageKey } from "@/utils";
import { MdMenuItemState } from "@/store/modules/Apidoc/interface";

export default defineComponent({
  components: {
    XDragLine,
    Search,
    Menu,
    // TagsOutlined,
    DownOutlined,
    UpOutlined,
    TagsSelect,
    [Tabs.name]: Tabs,
    [Tabs.TabPane.name]: Tabs.TabPane,
    [Button.name]: Button,
    [Space.name]: Space,
    [Tooltip.name]: Tooltip,
  },
  setup() {
    const router = useRouter();
    let store = useStore<GlobalState>();
    let menuData: MenuType[] = [];
    const tags: string[] = [];
    const state = reactive({
      sideWidth: computed(() => store.state.app.sideWidth),
      apiData: computed(() => store.state.apidoc.data),
      apiGroups: computed(() => store.state.apidoc.groups),
      mdMenus: computed(() => store.state.apidoc.mdMenus),
      appKey: computed(() => store.state.app.appKey),
      pageData: computed(() => store.state.app.pageData),
      menuData: menuData,
      keyword: "",
      tags: tags,
      openAllMenuFlag: false,
    });

    console.log(state.mdMenus);

    const onDragLineChange = (x: number) => {
      store.dispatch(`app/${Types.SET_SIDE_WIDTH}`, x);
    };

    const handleMenuData = (data: MenuType[]) => {
      // const menuData = cloneDeep(data);

      // const groupNames = state.apiGroups.map((p) => p.name);
      // let groupData = state.apiGroups.map((item) => {
      //   if (item.name == '0') {
      //     item.items = menuData.filter((p) => !groupNames.includes(p.group));
      //   } else {
      //     item.items = menuData.filter((p) => p.group == item.name);
      //   }
      //   if (item.items && item.items.length) {
      //     // item.items = this.handleSort(item.items);
      //   }
      //   return item;
      // });
      state.menuData = data;
    };

    watch<MenuType[]>(
      () => state.apiData,
      (menuData) => {
        handleMenuData(menuData);
      }
    );

    const onSearch = (keyword: string) => {
      console.log(keyword);
      state.keyword = keyword;
      handleMenuData(state.apiData);
    };

    const onTagsChange = (tags: string[]) => {
      state.tags = tags;
    };

    const toggleMenuOpen = () => {
      state.openAllMenuFlag = !state.openAllMenuFlag;
    };

    const onApiMenuSelect = (e: any) => {
      const currentNode = findNode<MenuType>(state.menuData, (node) => {
        if (node.menu_key === e.selectedKeys[0]) {
          return true;
        }
        return false;
      });
      if (currentNode && currentNode.url) {
        const key = createApiPageKey({
          method: currentNode.method as string,
          url: currentNode.url as string,
          appKey: state.appKey,
        });
        if (!state.pageData[key]) {
          store.dispatch(`app/${Types.ADD_PAGE_DATA}`, {
            ...currentNode,
            appKey: state.appKey,
            key,
          });
        }

        // const urlKey = currentNode.url && currentNode.url.replace(/\//g, "_");
        router.push({
          name: `ApiDetail`,
          query: {
            appKey: state.appKey,
            method: currentNode.method,
            url: currentNode.url,
          },
          params: {
            title: currentNode.title as string,
          },
        });
      }
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
    };

    return {
      ...toRefs(state),
      onDragLineChange,
      onSearch,
      toggleMenuOpen,
      onTagsChange,
      onApiMenuSelect,
      onMdMenuSelect,
    };
  },
});
</script>
<style lang="less" scoped>
@import "./index.less";
</style>
