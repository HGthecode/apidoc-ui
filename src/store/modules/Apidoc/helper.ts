import { ApiDataInfo, ApiItem } from "@/api/interface/apiData";
import { MenuItemType } from "@/components/Menu/src/interface";
import { createApiPageKey } from "@/utils";

interface ReturnHandleApiData {
  apiList: ApiItem[];
  apiMenus: MenuItemType[];
  apiObject: ApiObject;
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
  };
  // 递归处理数据
  function renderApiData(list: ApiItem[]): MenuItemType[] {
    const apiMenus = list.map((item) => {
      let key = "";

      let type = "folder";
      if (item.controller) {
        type = "controller";
      } else if (item.method && item.method.indexOf(",") > -1) {
        type = "multiple";
      } else if (item.method) {
        type = "api";
      }
      if (item.url) {
        // api接口存入list和object
        res.apiList.push(item);
        key = createApiPageKey({
          appKey: appKey as string,
          method: item.method as string,
          url: item.url as string,
        });
        res.apiObject[key] = item;
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
