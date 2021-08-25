import { ApiEventItem } from "@/api/interface/apiData";
import { getObjectValueByKey, setObjectValueByKey } from "@/utils";
import { setGolbalParam, removeGolbalParam } from "@/utils/event";
import { AxiosResponse } from "axios";
import { Store } from "vuex";
import md5 from "js-md5";
import { t } from "@/hooks/useI18n";

type ResultStatus = "success" | "error";
export interface ResultState {
  status: ResultStatus;
  list: ResultListItem[];
}

export interface ResultListItem {
  status: ResultStatus;
  title: string;
  desc: string;
}
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
  let result: ResultListItem[] = [];
  let resultStatus = "success";
  if (!(eventList && eventList.length)) {
    return {
      json,
    };
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
    let currentResult: ResultListItem = {
      status: "error",
      title: t(`apiPage.debug.event.${item.event}`),
      desc: "key non existent",
    };
    switch (item.event) {
      case "setHeader":
        // 设置请求header参数
        if (item.key) {
          json.headers[item.key] = value;
          currentResult.status = "success";
          currentResult.desc = `${item.key} = ${value}`;
        }
        break;
      case "setGlobalHeader":
        // 设置全局请求header参数
        if (item.key) {
          json.headers[item.key] = value;
          setGolbalParam(store, "header", item.key, value, item.desc);
          currentResult.status = "success";
          currentResult.desc = `${item.key} = ${value}`;
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
          currentResult.status = "success";
          currentResult.desc = `${item.key} = ${value}`;
        }
        break;
      case "clearGlobalHeader":
        // 清除全局请求header参数
        if (item.key) {
          delete json.headers[item.key];
          removeGolbalParam(store, "header", item.key);
          currentResult.status = "success";
          currentResult.desc = `${item.key}`;
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
          currentResult.status = "success";
          currentResult.desc = `${item.key}`;
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
          currentResult.status = "success";
          currentResult.desc = `${item.key} = ${value}`;
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
          currentResult.status = "success";
          currentResult.desc = `${item.key}`;
        }
        break;
      case "handleParam":
        // 处理指定参数
        if (item.key === "md5") {
          const key = item.value as string;
          let jsonParam = {};
          if (key.indexOf("params.") > -1) {
            const handleParams = setObjectValueByKey(
              { params: requestParams },
              key,
              md5(value as string)
            );
            jsonParam = handleParams.params;
          } else {
            jsonParam = setObjectValueByKey(requestParams, key, md5(value as string));
          }
          if (json.method == "get") {
            json.params = jsonParam;
          } else {
            json.data = jsonParam;
          }
          currentResult.status = "success";
          currentResult.desc = `${key} = md5(${value as string})`;
        } else {
          currentResult.desc = `key=${item.key} function non existent`;
        }

        break;
    }
    if (currentResult.status === "error") {
      resultStatus = "error";
    }
    result.push(currentResult);
  }
  return {
    json,
    result: {
      status: resultStatus,
      list: result,
    },
  };
};

export const handleRequestAfterEvent = (
  eventList: ApiEventItem[],
  json: ObjectType,
  res: AxiosResponse,
  store: Store<any>
): ResultState | boolean => {
  let result: ResultListItem[] = [];
  let resultStatus: ResultStatus = "success";
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
    let currentResult: ResultListItem = {
      status: "error",
      title: t(`apiPage.debug.event.${item.event}`),
      desc: "key non existent",
    };
    switch (item.event) {
      case "setGlobalHeader":
        // 设置全局请求header参数
        if (item.key) {
          setGolbalParam(store, "header", item.key, value, item.desc);
          currentResult.status = "success";
          currentResult.desc = `${item.key} = ${value}`;
        }
        break;
      case "setGlobalParam":
        // 设置全局请求params参数
        if (item.key) {
          setGolbalParam(store, "params", item.key, value, item.desc);
          currentResult.status = "success";
          currentResult.desc = `${item.key} = ${value}`;
        }
        break;
      case "clearGlobalHeader":
        // 清除全局请求header参数
        if (item.key) {
          removeGolbalParam(store, "header", item.key);
          currentResult.status = "success";
          currentResult.desc = `${item.key}`;
        }
        break;
      case "clearGlobalParam":
        // 清除全局请求params参数
        if (item.key) {
          removeGolbalParam(store, "params", item.key);
          currentResult.status = "success";
          currentResult.desc = `${item.key}`;
        }
        break;
    }
    if (currentResult.status === "error") {
      resultStatus = "error";
    }
    result.push(currentResult);
  }
  return {
    status: resultStatus,
    list: result,
  };
};
