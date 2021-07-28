import { trim } from "../index";
import Mock from "mockjs";

export function renderCodeJsonByParams<T>(params: T[], isMock?: boolean): objectState {
  let json: objectState = {};
  if (params && params.length) {
    params.forEach((item: any) => {
      let fieldValue = item.default;
      if (isMock && item.mock) {
        fieldValue = Mock.mock(item.mock);
      }
      if (!fieldValue) {
        switch (item.type) {
          case "int":
            fieldValue = 0;
            break;
          case "boolean":
            fieldValue = false;
            break;
          case "date":
            fieldValue = getNowTime();
            break;

          case "datetime":
            fieldValue = getNowTime("yyyy-MM-dd HH:mm:ss");
            break;
          case "time":
            fieldValue = getNowTime("HH:mm:ss");
            break;

          default:
            // eslint-disable-next-line no-undef
            // fieldValue = config.USE_TYPE_DEFAULT_VALUE ? item.type : "";
            break;
        }
      }
      if (item.type === "array" && (fieldValue === "array" || !fieldValue)) {
        fieldValue = [];
      }
      let value = ["int", "float", "boolean", "array"].includes(item.type)
        ? fieldValue
        : `${trim(fieldValue)}`;
      if (item.type == "object" && item.children && item.children.length) {
        value = renderCodeJsonByParams(item.children);
      } else if (item.type == "array" && item.children && item.children.length) {
        const childrenData = renderCodeJsonByParams(item.children);
        let childrenValue = null;
        if (item.childrenType == "array") {
          let arr = [];
          for (const key in childrenData) {
            arr.push(childrenData[key]);
          }

          childrenValue = arr;
        } else if (item.childrenType == "string") {
          childrenValue = "";
        } else if (item.childrenType == "int") {
          childrenValue = 0;
        } else {
          childrenValue = childrenData;
        }
        value = [childrenValue];
      } else if (item.type == "tree" && item.children && item.children.length) {
        const childrenData = renderCodeJsonByParams(item.children);
        value = [childrenData];
      }
      json[item.name] = value;
    });
  }

  return json;
}

/**
 * 获取指定数量的空格
 * @param {int} indent
 */
export function getIndent(indent: number): string {
  let string = "";
  for (let i = 0; i < indent; i++) {
    string += "\xa0";
  }
  return string;
}

export function getNowTime(fmt = "yyyy-MM-dd"): string {
  const date = new Date();
  let o: any = {
    "M+": date.getMonth() + 1, //月份
    "d+": date.getDate(), //日
    "H+": date.getHours(), //小时
    "h+": date.getHours(), //小时
    "m+": date.getMinutes(), //分
    "s+": date.getSeconds(), //秒
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds(), //毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (let k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return fmt;
}

// 格式方法
// 公共方法

interface callbackFunState {
  (err: string): void;
}
interface objectState {
  [key: string]: any;
}

// callback为数据格式化错误的时候处理函数
export function formatJsonCode(jsonObj: objectState): string {
  return JSON.stringify(jsonObj, null, "\t");
}
