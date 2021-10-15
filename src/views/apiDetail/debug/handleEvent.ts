import { ApiEventItem } from "@/api/interface/apiData";
import { getObjectValueByKey, setObjectValueByKey } from "@/utils";
import { setGolbalParam, removeGolbalParam } from "@/utils/event";
import { AxiosResponse } from "axios";
import { Store } from "vuex";
import md5 from "js-md5";
import { t } from "@/hooks/useI18n";
import Axios from "@/utils/http/index";
import { isArray, isObject } from "lodash";
import { DebugEventEnum } from "@/enums/debugEventEnum";
import moduleName from "ant-design-vue";

export type ResultStatus = "success" | "error" | "default";
type EventName =
  | "setHeader"
  | "setParam"
  | "clearParam"
  | "clearHeader"
  | "setGlobalHeader"
  | "setGlobalParam"
  | "clearGlobalHeader"
  | "clearGlobalParam"
  | "handleParam"
  | "ajax";

export interface EventResult {
  event: ApiEventItem;
  message?: string;
  json: any;
  result?: any;
}

export interface ResultState {
  status: ResultStatus;
  list: ResultListItem[];
}

export interface ResultListItem {
  status: ResultStatus;
  title: string;
  message: string;
}

/**
 * 获取事件message
 * @param eventItem
 * @returns
 */
export function getEventMessage(eventItem: ApiEventItem): string {
  if (
    ["clearParam", "clearHeader", "clearGlobalHeader", "clearGlobalParam"].includes(eventItem.event)
  ) {
    return eventItem.key as string;
  } else if (["handleParam"].includes(eventItem.event)) {
    const key = eventItem.value as string;
    return `${key} = md5(${eventItem.value})`;
  } else if (["ajax"].includes(eventItem.event)) {
    return `ajax("${eventItem.url}")`;
  }
  return `${eventItem.key} = ${eventItem.value}`;
}

const events = {
  setHeader(
    eventItem: ApiEventItem,
    json: any,
    value: any,
    store?: Store<any>
  ): Promise<EventResult> {
    return new Promise((resolve, reject) => {
      if (eventItem.key) {
        json.headers[eventItem.key] = encodeURIComponent(value);
        const res: EventResult = {
          event: eventItem,
          json,
        };
        resolve(res);
      } else {
        reject();
      }
    });
  },
  setParam(
    eventItem: ApiEventItem,
    json: any,
    value: any,
    store?: Store<any>
  ): Promise<EventResult> {
    return new Promise((resolve, reject) => {
      if (eventItem.key) {
        json.params[eventItem.key] = value;
        const res: EventResult = {
          event: eventItem,
          json,
        };
        resolve(res);
      } else {
        reject();
      }
    });
  },
  clearParam(
    eventItem: ApiEventItem,
    json: any,
    value: any,
    store?: Store<any>
  ): Promise<EventResult> {
    return new Promise((resolve, reject) => {
      if (eventItem.key) {
        delete json.params[eventItem.key];
        const res: EventResult = {
          event: eventItem,
          json,
        };
        resolve(res);
      } else {
        reject();
      }
    });
  },
  clearHeader(
    eventItem: ApiEventItem,
    json: any,
    value: any,
    store?: Store<any>
  ): Promise<EventResult> {
    return new Promise((resolve, reject) => {
      if (eventItem.key) {
        delete json.headers[eventItem.key];
        const res: EventResult = {
          event: eventItem,
          json,
        };
        resolve(res);
      } else {
        reject();
      }
    });
  },
  setGlobalHeader(
    eventItem: ApiEventItem,
    json: any,
    value: any,
    store: Store<any>
  ): Promise<EventResult> {
    return new Promise((resolve, reject) => {
      if (eventItem.key) {
        setGolbalParam(store, "headers", eventItem.key, value, eventItem.desc, eventItem.appKey);
        const res: EventResult = {
          event: eventItem,
          json,
        };
        resolve(res);
      } else {
        reject();
      }
    });
  },
  setGlobalParam(
    eventItem: ApiEventItem,
    json: any,
    value: any,
    store: Store<any>
  ): Promise<EventResult> {
    return new Promise((resolve, reject) => {
      if (eventItem.key) {
        setGolbalParam(store, "params", eventItem.key, value, eventItem.desc, eventItem.appKey);
        const res: EventResult = {
          event: eventItem,
          json,
        };
        resolve(res);
      } else {
        reject();
      }
    });
  },
  clearGlobalHeader(
    eventItem: ApiEventItem,
    json: any,
    value: any,
    store?: Store<any>
  ): Promise<EventResult> {
    return new Promise((resolve, reject) => {
      if (eventItem.key) {
        removeGolbalParam(store as Store<any>, "header", eventItem.key);
        const res: EventResult = {
          event: eventItem,
          json,
        };
        resolve(res);
      } else {
        reject();
      }
    });
  },
  clearGlobalParam(
    eventItem: ApiEventItem,
    json: any,
    value: any,
    store?: Store<any>
  ): Promise<EventResult> {
    return new Promise((resolve, reject) => {
      if (eventItem.key) {
        removeGolbalParam(store as Store<any>, "params", eventItem.key);
        const res: EventResult = {
          event: eventItem,
          json,
        };
        resolve(res);
      } else {
        reject();
      }
    });
  },
  handleParam(
    eventItem: ApiEventItem,
    json: any,
    value: any,
    store?: Store<any>
  ): Promise<EventResult> {
    return new Promise((resolve, reject) => {
      if (eventItem.key === "md5") {
        // 处理指定参数
        const key = eventItem.value as string;
        let jsonParam = {};
        if (key.indexOf("params.") > -1) {
          const handleParams = setObjectValueByKey(
            { params: json.params },
            key,
            md5(value as string)
          );
          jsonParam = handleParams.params;
        } else {
          jsonParam = setObjectValueByKey(json.params, key, md5(value as string));
        }
        json.params = jsonParam;

        const res: EventResult = {
          event: eventItem,
          json,
        };
        resolve(res);
      } else {
        reject();
      }
    });
  },
  ajax(eventItem: ApiEventItem, json: any): Promise<EventResult> {
    const requestParams = json.params;

    return new Promise((resolve, reject) => {
      if (eventItem.url) {
        const method = eventItem.method ? eventItem.method.toLowerCase() : "get";
        let ajaxOptions: any = {
          method,
          headers: {},
        };
        if (eventItem.contentType) {
          ajaxOptions.headers[method] = {
            "Content-Type": eventItem.contentType,
          };
        }
        // 执行前置生成请求参数
        let params: ObjectType = {};
        if (eventItem.value && isArray(eventItem.value)) {
          for (let i = 0; i < eventItem.value.length; i++) {
            const item = eventItem.value[i];
            if (item.type === "before") {
              let itemValue = item.value;
              if (item.value && item.value?.indexOf("params.") > -1) {
                itemValue = getObjectValueByKey(item.value, { params: requestParams });
              }
              if (item.event === "setParam") {
                if (item.key) {
                  params[item.key] = itemValue;
                } else {
                  params = itemValue;
                }
              } else if (item.event === "setHeader") {
                if (item.key) {
                  ajaxOptions.headers[item.key] = encodeURIComponent(itemValue);
                } else if (isObject(itemValue)) {
                  ajaxOptions.headers = itemValue;
                }
              }
            }
          }
        }
        if (method == "get") {
          ajaxOptions.params = params;
        } else {
          ajaxOptions.data = params;
        }

        Axios(eventItem.url, ajaxOptions)
          .then((ajaxRes) => {
            if (eventItem.value && isArray(eventItem.value)) {
              for (let i = 0; i < eventItem.value.length; i++) {
                const item = eventItem.value[i];
                if (item.type === "after") {
                  let itemValue = item.value;
                  if (item.value && item.value?.indexOf("res.") > -1) {
                    itemValue = getObjectValueByKey(item.value, { res: ajaxRes });
                  }
                  if (item.key && item.event === "setParam") {
                    json.params[item.key] = itemValue;
                  } else if (item.key && item.event === "setHeader") {
                    json.headers[item.key] = encodeURIComponent(itemValue);
                  }
                }
              }
            }
            const res: EventResult = {
              event: eventItem,
              result: ajaxRes,
              json,
            };
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  },
};

/**
 * 调试请求事件处理
 * @param eventList
 * @param json
 * @param store
 * @returns
 */
export async function handleRequestEvent(
  eventList: ApiEventItem[],
  json: ObjectType,
  store: Store<any>,
  res?: AxiosResponse
): Promise<ObjectType> {
  return new Promise((resolve) => {
    if (!(eventList && eventList.length)) {
      resolve({
        json,
      });
    }
    const requestParams = json.params;
    let eventPromiseList = [];
    for (let i = 0; i < eventList.length; i++) {
      const item = eventList[i];
      let value = item.value;
      if (item.value && item.value?.indexOf("params.") > -1) {
        value = getObjectValueByKey(item.value, { params: requestParams });
      } else if (item.value && item.value?.indexOf("res.") > -1) {
        value = getObjectValueByKey(item.value, { res: res });
      }
      if (events[item.event as EventName]) {
        eventPromiseList.push(events[item.event as EventName](item, json, value, store));
      }
    }
    Promise.allSettled(eventPromiseList)
      .then((resList) => {
        let result = [];
        let resJson = {};
        for (let i = 0; i < resList.length; i++) {
          const item = resList[i];
          if (item.status === "fulfilled") {
            const itemValue = item.value;
            resJson = { ...resJson, ...itemValue.json };
            result.push({
              status: "success",
              title: t(`apiPage.debug.event.${itemValue.event.event}`),
              message: getEventMessage(itemValue.event),
              result: itemValue.result,
              event: itemValue.event,
            });
          } else {
            const eventItem = eventList[i];
            result.push({
              status: "error",
              title: t(`apiPage.debug.event.${eventItem.event}`),
              message: item.reason.message,
              event: eventItem.event,
            });
          }
        }
        resolve({
          json: resJson,
          list: result,
        });
      })
      .catch((err) => {
        resolve({
          status: "error",
          list: [],
        });
      });
  });
}
