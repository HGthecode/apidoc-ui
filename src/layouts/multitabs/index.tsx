import "./index.less";
import { defineComponent, ref, computed, watch } from "vue";
import { Tabs, Dropdown, message } from "ant-design-vue";
import { onBeforeRouteUpdate, RouteLocationNormalized, RouteRecordRaw } from "vue-router";
import { useRouter, useRoute } from "vue-router";
import { isString } from "lodash";
import { routes } from "@/router/index";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import * as Types from "@/store/modules/App/types";
import { createApiPageKey, createMdPageKey } from "@/utils";
import { findNode } from "@/utils/helper/treeHelper";
import { MenuType } from "@/components/Menu/src/types";

// import { RouteRecordRaw } from "vue-router";

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const pageList = ref<RouteLocationNormalized[]>([]);
    const activeKey = ref("");
    const store = useStore<GlobalState>();
    const apiData = computed(() => store.state.apidoc.data);
    const appKey = computed(() => store.state.app.appKey);
    const sideWidth = computed(() => store.state.app.sideWidth);

    pageList.value = [
      {
        fullPath: "/home",
        hash: "",
        matched: [],
        meta: { title: "首页", affix: true },
        name: "Home",
        params: {},
        path: "/home",
        query: {},
        redirectedFrom: undefined,
      },
    ];

    // 初始化加入当前url的页面与获取页面参数
    let isInit = true;
    watch<MenuType[]>(
      () => apiData.value,
      (menuData) => {
        if (isInit && route.name === "ApiDetail") {
          const currentNode = findNode<MenuType>(apiData.value, (node) => {
            if (node.method === route.query.method && node.url === route.query.url) {
              return true;
            }
            return false;
          });
          if (currentNode) {
            const key = createApiPageKey({
              method: currentNode.method as string,
              url: currentNode.url as string,
              appKey: appKey.value,
            });
            store.dispatch(`app/${Types.ADD_PAGE_DATA}`, {
              ...currentNode,
              appKey: appKey.value,
              key,
            });

            pageList.value.push({
              ...route,
              params: {
                title: currentNode.title as string,
              },
            });
          }
          activeKey.value = route.fullPath;
        }
        isInit = false;
      }
    );

    const onRemove = (targetKey: string | MouseEvent) => {
      if (!((targetKey as string) && isString(targetKey))) {
        targetKey = activeKey.value;
      }
      removePageData(targetKey);
      pageList.value = pageList.value.filter((page) => page.fullPath !== targetKey);
      if (targetKey === activeKey.value) {
        selectedLastPath();
      }
    };

    /**
     * 删除tabs页面数据
     * @param targetKey
     */
    const removePageData = (targetKey: string | MouseEvent) => {
      const findIndex: number = pageList.value.findIndex(
        (page) => page.fullPath === (targetKey as string)
      );
      const findData = pageList.value[findIndex];

      let key = "";
      if (findData && findData.name === "ApiDetail") {
        key = createApiPageKey({
          appKey: findData.query.appKey as string,
          method: findData.query.method as string,
          url: findData.query.url as string,
        });
      } else if (findData && findData.name === "mdDetail") {
        key = createMdPageKey({
          appKey: findData.query.appKey as string,
          path: findData.query.path as string,
        });
      }
      if (key) {
        store.dispatch(`app/${Types.REMOVE_PAGE_DATA}`, key);
      }
    };

    const selectedLastPath = () => {
      const pageListValue = pageList.value;
      activeKey.value = pageListValue[pageListValue.length - 1].fullPath;
      router.push(activeKey.value);
    };

    const onEdit = (targetKey: string | MouseEvent, action: "add" | "remove") => {
      switch (action) {
        case "remove":
          onRemove(targetKey);
          break;
      }
    };

    const onChange = (key: string) => {
      router.push(key);
    };

    /**
     * 路由跳转前触发
     */
    onBeforeRouteUpdate((to: RouteLocationNormalized) => {
      const find = pageList.value.find((p) => p.fullPath === to.fullPath);
      if (!find) {
        pageList.value.push(to);
      }
      activeKey.value = to.fullPath;
    });

    /**
     * 删除当前tab
     * @param keyPath
     */
    function closeThat(keyPath: string) {
      onRemove(keyPath);
    }

    /**
     * 删除左侧或右侧的tab
     * @param keyPath
     * @param direction
     */
    function closeLeftOrRight(keyPath: string, direction: "left" | "right") {
      const currentIndex = pageList.value.findIndex((p) => p.fullPath === keyPath);

      if (
        (direction === "left" && currentIndex > 0) ||
        (direction === "right" && currentIndex < pageList.value.length - 1)
      ) {
        pageList.value = pageList.value.filter((item, index) => {
          if (
            (direction === "left" && index >= currentIndex) ||
            (direction === "right" && index <= currentIndex) ||
            item.meta.affix
          ) {
            return true;
          }
          removePageData(item.fullPath);
          return false;
        });
        const activeFind = pageList.value.find((p) => p.fullPath === activeKey.value);
        if (!activeFind) {
          selectedLastPath();
        }
      } else {
        message.info(`${direction == "left" ? "左侧" : "右侧"}没有标签`);
      }
    }

    /**
     * 删除全部tab
     */
    function closeAll() {
      pageList.value = pageList.value.filter((item, index) => {
        if (item.meta.affix) {
          return true;
        }
        removePageData(item.fullPath);
        return false;
      });
      const activeFind = pageList.value.find((p) => p.fullPath === activeKey.value);
      if (!activeFind) {
        selectedLastPath();
      }
    }

    function renderTabPaneMenu(keyPath: string) {
      return (
        <div class="tab-menu select-menu">
          <ul>
            <li onClick={() => closeThat(keyPath)}>关闭当前</li>
            <li onClick={() => closeLeftOrRight(keyPath, "left")}>关闭左侧</li>
            <li onClick={() => closeLeftOrRight(keyPath, "right")}>关闭右侧</li>
            <li onClick={() => closeAll()}>关闭全部</li>
          </ul>
        </div>
      );
    }

    // render
    function renderTabPane(title: string, keyPath: string) {
      const menu = renderTabPaneMenu(keyPath);

      return (
        <Dropdown overlay={menu} trigger={["contextmenu"]}>
          <span style={{ userSelect: "none" }}>{title}</span>
        </Dropdown>
      );
    }

    return () => {
      const tabPanes = pageList.value.map((page) => {
        let title = page.meta.title as string;
        if (page.params.title as string) {
          title = page.params.title as string;
        }
        let hasClosable = true;
        let tab = renderTabPane(title, page.fullPath);
        if (page.meta.affix) {
          hasClosable = false;
          tab = <span style={{ userSelect: "none" }}>{title}</span>;
        }
        return (
          <Tabs.TabPane
            style={{ height: 0 }}
            tab={tab}
            key={page.fullPath}
            closable={hasClosable}
          />
        );
      });
      return (
        <div class="multi-tab-wrapper" style={{ left: `${sideWidth.value}px` }}>
          <Tabs
            hideAdd
            type={"editable-card"}
            size="small"
            activeKey={activeKey.value}
            tabBarStyle={{
              background: "#FFF",
              margin: 0,
              paddingTop: "3px",
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
            onEdit={onEdit}
            onChange={onChange}
          >
            {tabPanes}
          </Tabs>
        </div>
      );
    };
  },
});
