import { ApiDataInfo, ApiItem } from "@/api/interface/apiData";
import { MenuItemType } from "@/components/Menu/src/interface";
import { createApiPageKey } from "@/utils";
import { ApiAnalysisData } from "@/store/modules/Apidoc/interface";
import { MdMenuItem } from "@/api/interface/markdown";
import { ConfigAppItem } from "@/api/interface/config";

interface ReturnHandleApiData {
  apiList: ApiItem[];
  apiMenus: MenuItemType[];
  apiObject: ApiObject;
  apiAnalysis: ApiAnalysisData;
}

interface ApiObject {
  [key: string]: ApiItem;
}

/**
 * 处理apiData接口响应数据
 * @param data
 * @param appKey
 * @returns
 */
export function handleApiData(data: ApiDataInfo, appKey: string): ReturnHandleApiData {
  const apiData = data.data;
  const res: ReturnHandleApiData = {
    apiList: [],
    apiMenus: [],
    apiObject: {},
    apiAnalysis: {
      apiCount: 0,
      apiMethodTotal: {},
      controllerGroupTotal: {},
      apiGroupTotal: {},
      apiTagTotal: {},
      apiAuthorTotal: {},
    },
  };
  // 递归处理数据
  function renderApiData(list: ApiItem[]): MenuItemType[] {
    const apiMenus = list.map((item) => {
      let key = "";
      const method = item.method as string;
      let methodList: string[] = [];

      let type = "folder";
      if (item.controller) {
        type = "controller";
      } else if (method && method.indexOf(",") > -1) {
        type = "multiple";
        methodList = method.split(",");
      } else if (method) {
        type = "api";
        methodList = [method];
      }
      if (type === "controller" && item.group) {
        // 控制器分组
        const groupName = item.group;
        // 分组下的api数量
        const childrenApiCount = item.children && item.children.length ? item.children.length : 0;
        if (res.apiAnalysis.apiGroupTotal[groupName]) {
          res.apiAnalysis.apiGroupTotal[groupName] =
            res.apiAnalysis.apiGroupTotal[groupName] + childrenApiCount;
        } else {
          res.apiAnalysis.apiGroupTotal[groupName] = childrenApiCount;
        }
        // 分组下的控制器数量
        if (res.apiAnalysis.controllerGroupTotal[groupName]) {
          res.apiAnalysis.controllerGroupTotal[groupName] =
            res.apiAnalysis.controllerGroupTotal[groupName] + 1;
        } else {
          res.apiAnalysis.controllerGroupTotal[groupName] = 1;
        }
      } else if (item.url) {
        // api接口存入list和object
        res.apiList.push(item);
        key = createApiPageKey({
          appKey: appKey as string,
          method: method as string,
          url: item.url as string,
        });
        res.apiObject[key] = item;
        // 接口总数
        res.apiAnalysis.apiCount++;
        // 统计请求类型数量
        if (methodList && methodList.length) {
          for (let i = 0; i < methodList.length; i++) {
            const methodItem = methodList[i];
            if (res.apiAnalysis.apiMethodTotal[methodItem]) {
              res.apiAnalysis.apiMethodTotal[methodItem] =
                res.apiAnalysis.apiMethodTotal[methodItem] + 1;
            } else {
              res.apiAnalysis.apiMethodTotal[methodItem] = 1;
            }
          }
        }
        // tag统计
        if (item.tag && item.tag.length) {
          for (let i = 0; i < item.tag.length; i++) {
            const tagItem = item.tag[i];
            if (res.apiAnalysis.apiTagTotal[tagItem]) {
              res.apiAnalysis.apiTagTotal[tagItem] = res.apiAnalysis.apiTagTotal[tagItem] + 1;
            } else {
              res.apiAnalysis.apiTagTotal[tagItem] = 1;
            }
          }
        }
        // 作者接口数量统计
        if (item.author) {
          if (res.apiAnalysis.apiAuthorTotal[item.author]) {
            res.apiAnalysis.apiAuthorTotal[item.author] =
              res.apiAnalysis.apiAuthorTotal[item.author] + 1;
          } else {
            res.apiAnalysis.apiAuthorTotal[item.author] = 1;
          }
        }
      }
      // api接口菜单数据
      const menuItem: MenuItemType = {
        title: item.title,
        menu_key: item.menu_key,
        type: type,
        method: item.method as string,
        url: item.url,
        tag: item.tag,
        key,
      };
      if (item.children && item.children.length) {
        menuItem.children = renderApiData(item.children);
      }
      return menuItem;
    });

    return apiMenus;
  }
  res.apiMenus = renderApiData(apiData);
  return res;
}

export function handleMdMenusData(data: MdMenuItem[]): any {
  let result = {
    menus: [],
    count: 0,
  };
  function renderMdMenuData(list: MdMenuItem[]): any {
    const mdMenus = list.map((item) => {
      if (item.path) {
        result.count++;
      }
      if (item.children && item.children.length) {
        item.children = renderMdMenuData(item.children);
      }
      return item;
    });
    return mdMenus;
  }
  result.menus = renderMdMenuData(data);
  return result;
}

export function handleConfigAppsData(data: ConfigAppItem[]): any {
  let result = {
    count: 0,
  };
  function renderAppsData(list: ConfigAppItem[]): any {
    const mdMenus = list.map((item) => {
      if (item.folder && !(item.items && item.items.length)) {
        result.count++;
      }
      if (item.items && item.items.length) {
        item.items = renderAppsData(item.items);
      }
      return item;
    });
    return mdMenus;
  }
  renderAppsData(data);
  return result;
}
