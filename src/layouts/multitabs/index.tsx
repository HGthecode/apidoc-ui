import "./index.less";
import { defineComponent, ref, computed, watch, reactive } from "vue";
import { Tabs, Dropdown, message } from "ant-design-vue";
import { onBeforeRouteUpdate, RouteLocationNormalized } from "vue-router";
import { useRouter, useRoute } from "vue-router";
import { isString } from "lodash";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import * as Types from "@/store/modules/App/types";
import { findNode } from "@/utils/helper/treeHelper";
import { MenuItemType } from "@/components/Menu/src/interface";
import { useI18n } from "@/hooks/useI18n";
interface stateType {
  pageList: RouteLocationNormalized[];
  activeKey: string;
  appKey: string;
  sideWidth: number;
  apiMenus: MenuItemType[];
  isMobile: boolean;
}

export default defineComponent({
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const route = useRoute();
    const store = useStore<GlobalState>();

    const state: stateType = reactive({
      pageList: [],
      activeKey: "",
      apiMenus: computed(() => store.state.apidoc.apiMenus),
      appKey: computed(() => store.state.app.appKey),
      sideWidth: computed(() => store.state.app.sideWidth),
      isMobile: computed(() => store.state.app.isMobile),
    });

    state.pageList = [
      {
        fullPath: "/home",
        hash: "",
        matched: [],
        meta: { title: t("home.title"), affix: true },
        name: "Home",
        params: {},
        path: "/home",
        query: {},
        redirectedFrom: undefined,
      },
    ];

    // 初始化加入当前url的页面与获取页面参数
    let isInit = true;
    watch<MenuItemType[]>(
      () => state.apiMenus,
      (menuData) => {
        if (isInit && route.name === "ApiDetail") {
          const currentNode = findNode<MenuItemType>(state.apiMenus, (node) => {
            if (node.key === route.query.key) {
              return true;
            }
            return false;
          });
          if (currentNode) {
            state.pageList.push({
              ...route,
              params: {
                title: currentNode.title as string,
              },
            });
          }
          state.activeKey = route.fullPath;
        }
        isInit = false;
      }
    );

    const onRemove = (targetKey: string | MouseEvent) => {
      if (!((targetKey as string) && isString(targetKey))) {
        targetKey = state.activeKey;
      }
      // removePageData(targetKey);
      state.pageList = state.pageList.filter((page) => page.fullPath !== targetKey);
      if (targetKey === state.activeKey) {
        selectedLastPath();
      }
      removePageData([targetKey]);
    };

    /**
     * 删除tabs页面数据
     * @param targetKey
     */
    const removePageData = (keys: string[] | MouseEvent[]) => {
      setTimeout(() => {
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          store.dispatch(`app/${Types.REMOVE_PAGE_DATA}`, key);
        }
      }, 100);
    };

    const selectedLastPath = () => {
      const pageListValue = state.pageList;
      state.activeKey = pageListValue[pageListValue.length - 1].fullPath;
      router.push(state.activeKey);
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
      const find = state.pageList.find((p) => p.fullPath === to.fullPath);
      if (!find) {
        state.pageList.push(to);
      }
      state.activeKey = to.fullPath;
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
      const currentIndex = state.pageList.findIndex((p) => p.fullPath === keyPath);

      if (
        (direction === "left" && currentIndex > 0) ||
        (direction === "right" && currentIndex < state.pageList.length - 1)
      ) {
        let removeKeys: string[] = [];
        state.pageList = state.pageList.filter((item, index) => {
          if (
            (direction === "left" && index >= currentIndex) ||
            (direction === "right" && index <= currentIndex) ||
            item.meta.affix
          ) {
            return true;
          }
          removeKeys.push(item.fullPath);
          return false;
        });
        const activeFind = state.pageList.find((p) => p.fullPath === state.activeKey);
        if (!activeFind) {
          selectedLastPath();
        }
        removePageData(removeKeys);
      } else {
        message.info(
          `${direction == "left" ? t("layout.tabs.leftSide") : t("layout.tabs.rightSide")}${t(
            "layout.tabs.notTab"
          )}`
        );
      }
    }

    /**
     * 删除全部tab
     */
    function closeAll() {
      let removeKeys: string[] = [];
      state.pageList = state.pageList.filter((item, index) => {
        if (item.meta.affix) {
          return true;
        }
        removeKeys.push(item.fullPath);
        return false;
      });
      const activeFind = state.pageList.find((p) => p.fullPath === state.activeKey);
      if (!activeFind) {
        selectedLastPath();
      }
      removePageData(removeKeys);
    }

    function renderTabPaneMenu(keyPath: string) {
      return (
        <div class="tab-menu select-menu">
          <ul>
            <li onClick={() => closeThat(keyPath)}>{t("layout.tabs.closeCurrent")}</li>
            <li onClick={() => closeLeftOrRight(keyPath, "left")}>{t("layout.tabs.closeLeft")}</li>
            <li onClick={() => closeLeftOrRight(keyPath, "right")}>
              {t("layout.tabs.closeRight")}
            </li>
            <li onClick={() => closeAll()}>{t("layout.tabs.closeAll")}</li>
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
      const tabPanes = state.pageList.map((page) => {
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

      const classNames = ["multi-tab-wrapper"];
      if (state.isMobile) {
        classNames.push("mobile");
      }
      return (
        <div class={classNames} style={{ left: `${state.sideWidth}px` }}>
          <Tabs
            hideAdd
            type={"editable-card"}
            size="small"
            activeKey={state.activeKey}
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
