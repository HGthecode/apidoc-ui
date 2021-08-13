import { ApiEventItem } from "@/api/interface/apiData";
import { getObjectValueByKey } from "@/utils";
import { setGolbalParam, removeGolbalParam } from "@/utils/event";
import { AxiosResponse } from "axios";
import { Store } from "vuex";

/**
 * 调试请求前事件处理
 * @param eventList
 * @param json
 * @param store
 * @returns
 */
export const handleRequestBeforeEvent = (
  eventList: ApiEventItem[],
  json: ObjectType,
  store: Store<any>
): ObjectType => {
  if (!(eventList && eventList.length)) {
    return json;
  }
  let requestParams = {};
  if (json.method == "get") {
    requestParams = json.params;
  } else {
    requestParams = json.data;
  }
  for (let i = 0; i < eventList.length; i++) {
    const item = eventList[i];
    let value = item.value;
    if (item.value && item.value?.indexOf("params.") > -1) {
      value = getObjectValueByKey(item.value, { params: requestParams });
    }
    switch (item.event) {
      case "setHeader":
        // 设置请求header参数
        if (item.key) {
          json.headers[item.key] = value;
        }
        break;
      case "setGlobalHeader":
        // 设置全局请求header参数
        if (item.key) {
          json.headers[item.key] = value;
          setGolbalParam(store, "header", item.key, value, item.desc);
        }
        break;
      case "setGlobalParam":
        // 设置全局请求params参数
        if (item.key) {
          if (json.method == "get") {
            json.params[item.key] = value;
          } else {
            json.data[item.key] = value;
          }
          setGolbalParam(store, "params", item.key, value, item.desc);
        }
        break;
      case "clearGlobalHeader":
        // 清除全局请求header参数
        if (item.key) {
          delete json.headers[item.key];
          removeGolbalParam(store, "header", item.key);
        }
        break;
      case "clearGlobalParam":
        // 清除全局请求params参数
        if (item.key) {
          if (json.params) {
            delete json.params[item.key];
          }
          if (json.data) {
            delete json.data[item.key];
          }
          removeGolbalParam(store, "params", item.key);
        }
        break;
      case "setParam":
        // 设置请求参数
        if (item.key) {
          if (json.method == "get") {
            json.params[item.key] = value;
          } else {
            json.data[item.key] = value;
          }
        }
        break;
      case "clearParam":
        // 清除指定请求参数
        if (item.key) {
          if (json.params) {
            delete json.params[item.key];
          }
          if (json.data) {
            delete json.data[item.key];
          }
        }
        break;
    }
  }
  return json;
};

export const handleRequestAfterEvent = (
  eventList: ApiEventItem[],
  json: ObjectType,
  res: AxiosResponse,
  store: Store<any>
): void | boolean => {
  if (!(eventList && eventList.length)) {
    return false;
  }
  let requestParams = {};
  if (json.method == "get") {
    requestParams = json.params;
  } else {
    requestParams = json.data;
  }
  for (let i = 0; i < eventList.length; i++) {
    const item = eventList[i];
    let value = item.value;
    if (item.value && item.value?.indexOf("params.") > -1) {
      value = getObjectValueByKey(item.value, { params: requestParams });
    } else if (item.value && item.value?.indexOf("res.") > -1) {
      value = getObjectValueByKey(item.value, { res: res });
    }
    switch (item.event) {
      case "setGlobalHeader":
        // 设置全局请求header参数
        if (item.key) {
          setGolbalParam(store, "header", item.key, value, item.desc);
        }
        break;
      case "setGlobalParam":
        // 设置全局请求params参数
        if (item.key) {
          setGolbalParam(store, "params", item.key, value, item.desc);
        }
        break;
      case "clearGlobalHeader":
        // 清除全局请求header参数
        if (item.key) {
          removeGolbalParam(store, "header", item.key);
        }
        break;
      case "clearGlobalParam":
        // 清除全局请求params参数
        if (item.key) {
          removeGolbalParam(store, "params", item.key);
        }
        break;
    }
  }
};
