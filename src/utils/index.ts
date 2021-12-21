import { ConfigAppItem } from "@/api/interface/config";
import { cloneDeep } from "lodash";
import { createMdPageKeyState } from "./interface";
import { KEEPALIVE_PAGE_COMMA } from "@/store/modules/App/types";

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
    document.execCommand("copy");
    isSuccess = true;
  } catch (e) {
    throw new Error();
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
      if (k) {
        value = value[k];
      }
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

export const getAppsConfigItemByKey = (
  apps: ConfigAppItem[],
  appKey: string
): ConfigAppItem | undefined => {
  if (!(apps && apps.length && appKey)) {
    return;
  }
  let list: ConfigAppItem[] = cloneDeep(apps);
  let item: ConfigAppItem | undefined = undefined;
  const keys = appKey.split(",");
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const find = list.find((p) => p.folder === key);
    if (find) {
      list = find.items as ConfigAppItem[];
      item = find;
    }
  }
  return item;
};

export const getAppsConfigItemsByKey = (
  apps: ConfigAppItem[],
  appKey: string
): ConfigAppItem[] | undefined => {
  if (!(apps && apps.length && appKey)) {
    return;
  }
  let items = [];
  let list: ConfigAppItem[] = cloneDeep(apps);
  let item: ConfigAppItem | undefined = undefined;
  const keys = appKey.split(",");
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const find = list.find((p) => p.folder === key);
    if (find) {
      list = find.items as ConfigAppItem[];
      item = find;
      items.push(item);
    }
  }
  return items;
};

/**
 * 替换apps配置的变量
 * @param apps 应用配置列表
 * @param appKey 当前key
 * @param str 替换的内容
 * @returns
 */
export const replaceAppConfigKeys = (
  apps: ConfigAppItem[],
  appKey: string,
  str: string
): string => {
  if (!(apps && apps.length && appKey)) {
    return "";
  }
  let text = str;
  const appList = getAppsConfigItemsByKey(apps, appKey);
  if (appList && appList.length) {
    for (let i = 0; i < appList.length; i++) {
      const item: any = appList[i];
      for (const key in item) {
        const keyStr = `\${app[${i}].${key}}`;
        if (text.indexOf(keyStr) > -1) {
          const reg = RegExpEscape(keyStr);
          const exp = new RegExp(reg, "g");
          text = text.replace(exp, item[key]);
        }
      }
    }
  }
  return text;
};

const RegExpEscape = (s: string) => {
  return s.replace(/[-\\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

export const confirmEndingString = (str: string, target: string): boolean => {
  const start = str.length - target.length;
  const arr = str.substr(start, target.length);
  if (arr == target) {
    return true;
  }
  return false;
};

/**
 * 转换keepAliveKey中的逗号
 * @param key
 * @param escape
 * @returns
 */
export const replaceKeepAlivePageComma = (key: string, escape?: boolean): string => {
  if (escape) {
    const reg = new RegExp(KEEPALIVE_PAGE_COMMA, "g");
    return key.replace(reg, ",");
  }
  return key.replace(/,/g, KEEPALIVE_PAGE_COMMA);
};

// 生成随机数字，max限制最大值，min限制最小值
export const getRandomNumber = (max: number, min?: number): number => {
  return Math.floor(Math.random() * max + (min ? min : 0));
};

// 根据前17位生成末位
export const createIdcardEndNumber = (idcard: string) => {
  let arrExp = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]; // 加权因子
  let arrValid = [1, 0, "X", 9, 8, 7, 6, 5, 4, 3, 2]; // 校验码
  let sum = 0;
  for (let j = 0; j < 17; j++) {
    // 对前17位数字与权值乘积求和
    sum += parseInt(idcard[j], 10) * arrExp[j];
  }
  return arrValid[sum % 11];
};

// 生成身份证号
export const createIdcard = () => {
  let cityPrefixs = [
    11, 12, 13, 14, 15, 21, 22, 23, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 50, 51, 52,
    53, 54, 61, 62, 63, 64, 65, 71, 81, 82,
  ];
  let idcard = cityPrefixs[getRandomNumber(cityPrefixs.length)] + "";

  for (let i = 2; i < 18; i++) {
    if (i < 6) {
      idcard += getRandomNumber(10);
    } else if (i == 6) {
      idcard += getRandomNumber(2, 1); //年份第一位仅支持1和2
    } else if (i == 7) {
      idcard += idcard[6] == "1" ? 9 : 0; //两位年份规则，仅支持19和20
    } else if (i == 8) {
      idcard += idcard[6] == "1" ? getRandomNumber(7, 3) : getRandomNumber(2); //三位年份规则，仅支持193-199、200、201这些值
    } else if (i == 9) {
      idcard += getRandomNumber(10); //四位年份规则,0-9
    } else if (i == 10) {
      idcard += getRandomNumber(2); //首位月份规则
    } else if (i == 11) {
      idcard += idcard[10] == "0" ? getRandomNumber(9, 1) : getRandomNumber(3); //末位月份规则
    } else if (i == 12) {
      let maxDays = new Date(
        Number(idcard.substr(6, 4)),
        Number(idcard.substr(10, 2)),
        0
      ).getDate(); // 获取当月最大天数
      let day = getRandomNumber(maxDays, 1);
      idcard += day < 10 ? "0" + day : day;
      i++;
    } else if (i > 13 && i < 17) {
      idcard += getRandomNumber(10);
    } else if (i == 17) {
      idcard += createIdcardEndNumber(idcard);
    }
  }
  return idcard;
};
