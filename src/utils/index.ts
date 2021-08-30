import { createApiPageKeyState, createMdPageKeyState } from "./interface";

// 创建api接口页面的key
export const createApiPageKey = (apiData: createApiPageKeyState): string => {
  let method = apiData.method;
  if (method && method.indexOf(",") > -1) {
    method = method.replace(/,/g, "");
  }
  return `${apiData.appKey}_${method}_${apiData.url}`;
};

// 创建md文档页面的key
export const createMdPageKey = (apiData: createMdPageKeyState): string => {
  return `${apiData.appKey}_md_${apiData.path}`;
};

export const copyTextToClipboard = (text: string): boolean => {
  const element = document.createElement("textarea");
  element.value = text;
  element.setAttribute("readonly", "");
  element.style.position = "absolute";
  element.style.left = "-9999px";
  element.style.fontSize = "12pt";
  const selection = document.getSelection();
  let originalRange;
  if (selection && selection.rangeCount > 0) {
    originalRange = selection.getRangeAt(0);
  }
  document.body.append(element);
  element.select();
  element.selectionStart = 0;
  element.selectionEnd = text.length;
  let isSuccess = false;
  try {
    isSuccess = document.execCommand("copy");
  } catch (e) {
    throw new Error(e);
  }
  element.remove();
  if (originalRange && selection) {
    selection.removeAllRanges();
    selection.addRange(originalRange);
  }
  return isSuccess;
};

/**
 * 去除字符串首尾空格
 * @param {string} s
 */
export const trim = (s: string): string => {
  if (s) {
    return s.replace(/(^\s*)|(\s*$)/g, "");
  }
  return "";
};

/**
 * 创建随机key
 * @returns {string}
 */
export const createRandKey = (): string => {
  return new Date().getTime() + Math.ceil(Math.random() * 1000) + "";
};

/**
 * 将文本内的特殊标记替换成html
 * @param {string} text
 * @returns
 */
export const textToHtml = (text: string): string => {
  return text ? text.replace(/ /g, "&nbsp;").replace(/\r\n/g, "<br>") : "";
};

// 获取对象中指定key的值
export const getObjectValueByKey = (key: string, obj: ObjectType): any => {
  let value = obj;
  if (key && key.indexOf(".") > -1) {
    const keysArr = key.split(".");
    for (let i = 0; i < keysArr.length; i++) {
      const k = keysArr[i];
      value = value[k];
    }
  } else if (key) {
    value = value[key];
  }
  return value;
};

//  设置对象中指定key的值
export const setObjectValueByKey = (obj: ObjectType, key: string, value: string): any => {
  let res = obj;
  if (key && key.indexOf(".") > -1) {
    const keysArr = key.split(".");
    let find = res;
    for (let i = 0; i < keysArr.length; i++) {
      const k = keysArr[i];
      if (i >= keysArr.length - 1 && find[k]) {
        find[k] = value;
      } else if (find[k]) {
        find = find[k];
      }
    }
  } else if (key && res[key]) {
    res[key] = value;
  }
  return res;
};

/**
 * 重新加载首页
 */
export const reloadHomePage = (): void => {
  const url = window.location.href;
  let toPath = "/apidoc";
  if (url.indexOf("#") > -1) {
    toPath = url.split("#")[0];
  }
  window.location.href = toPath;
};
