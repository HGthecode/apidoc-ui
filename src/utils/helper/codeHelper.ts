import { trim } from "../index";

/**
 * 根据参数生成json字符串
 * @param {array}} params
 * @param {int} indent
 * @param {*} notes
 */
export function renderCodeByParams<T>(params: T[], indent = 0, notes?: boolean): string {
  const indentContent = getIndent(indent);
  const valueIndentContent = getIndent(indent + 2);

  let code = indentContent + "{\n";
  if (indent > 0) {
    code = "";
  }

  if (params && params.length) {
    params.forEach((item: any) => {
      let fieldValue = item.default;
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
        fieldValue = "[]";
      }

      let value = ["int", "float", "boolean", "array"].includes(item.type)
        ? fieldValue
        : `"${trim(fieldValue)}"`;
      let type = "string";
      let noteText = "";
      if (notes) {
        noteText = "//" + item.desc + "";
      }

      if (item.type == "object" && item.params && item.params.length) {
        let arrayCode = "{    " + noteText + "\n";
        arrayCode += renderCodeByParams(item.params, indent + 2, notes);
        arrayCode += valueIndentContent + "},\n";
        value = arrayCode;

        type = "object";
      } else if (item.type == "array" && item.params && item.params.length) {
        let childrenTypeCodeStart = valueIndentContent + getIndent(2);
        let childrenTypeCodeEnd = valueIndentContent + getIndent(2);
        // 根据子节点类型渲染不同的结构
        if (item.childrenType == "array") {
          childrenTypeCodeStart = childrenTypeCodeStart + "[\n";
          childrenTypeCodeEnd = childrenTypeCodeEnd + "]\n";
          item.params = item.params.map((p: any) => {
            p.name = null;
            return p;
          });
        } else if (["string", "int"].includes(item.childrenType)) {
          childrenTypeCodeStart = "";
          childrenTypeCodeEnd = "";
          item.params = item.params.map((p: any) => {
            p.name = null;
            return p;
          });
        } else {
          childrenTypeCodeStart = childrenTypeCodeStart + "{\n";
          childrenTypeCodeEnd = childrenTypeCodeEnd + "}\n";
        }
        let arrayCode = "[    " + noteText + "\n";
        arrayCode += childrenTypeCodeStart;
        arrayCode += renderCodeByParams(item.params, indent + 4, notes);
        arrayCode += childrenTypeCodeEnd;
        arrayCode += valueIndentContent + "],\n";
        value = arrayCode;
        type = "array";
      } else if (item.type == "tree" && item.params && item.params.length) {
        let arrayCode = "[    " + noteText + "\n";
        arrayCode += valueIndentContent + getIndent(2) + "{\n";
        arrayCode += renderCodeByParams(item.params, indent + 4);
        arrayCode += valueIndentContent + getIndent(2) + "}\n";
        arrayCode += valueIndentContent + "],\n";
        value = arrayCode;
        type = "tree";
      }
      let desc = "";
      if (!(type === "array" || type == "object" || type === "tree")) {
        if (notes) {
          desc = `,  // ${item.desc}\n`;
        } else {
          desc = `,\n`;
        }
      }
      const key = item.name ? `"${item.name}": ` : "";
      code += `${valueIndentContent}${key}${value}${desc}`;
    });
  }
  if (indent == 0) {
    const codeText = code.substring(0, code.lastIndexOf(","));
    code = codeText + "\n" + "}\n";
  }

  return code;
}

export function renderCodeJsonByParams<T>(params: T[]): objectState {
  let json: objectState = {};
  if (params && params.length) {
    params.forEach((item: any) => {
      let fieldValue = item.default;
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
      if (item.type == "object" && item.params && item.params.length) {
        value = renderCodeJsonByParams(item.params);
      } else if (item.type == "array" && item.params && item.params.length) {
        const childrenData = renderCodeJsonByParams(item.params);
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
      } else if (item.type == "tree" && item.params && item.params.length) {
        const childrenData = renderCodeJsonByParams(item.params);
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

export function transitionJsonToString(jsonObj: objectState, callback?: callbackFunState): string {
  // 转换后的jsonObj受体对象
  let _jsonObj = "";
  // 判断传入的jsonObj对象是不是字符串，如果是字符串需要先转换为对象，再转换为字符串，这样做是为了保证转换后的字符串为双引号
  if (Object.prototype.toString.call(jsonObj) !== "[object String]") {
    try {
      _jsonObj = JSON.stringify(jsonObj);
    } catch (error) {
      // 转换失败错误信息
      console.error("您传递的json数据格式有误，请核对...");
      console.error(error);
      callback && callback(error);
    }
  } else {
    try {
      const jsonObj1 = jsonObj.replace(/(\\')/g, '"');
      _jsonObj = JSON.stringify(JSON.parse(jsonObj1));
    } catch (error) {
      // 转换失败错误信息
      console.error("您传递的json数据格式有误，请核对...");
      console.error(error);
      callback && callback(error);
    }
  }
  return _jsonObj;
}

// callback为数据格式化错误的时候处理函数
export function formatJson(jsonObj: objectState, callback?: callbackFunState): string {
  // 正则表达式匹配规则变量
  let reg = null;
  // 转换后的字符串变量
  let formatted = "";
  // 换行缩进位数
  let pad = 0;
  // 一个tab对应空格位数
  let PADDING = "    ";
  // json对象转换为字符串变量
  let jsonString = transitionJsonToString(jsonObj, callback);
  if (!jsonString) {
    return jsonString;
  }
  // 存储需要特殊处理的字符串段
  let _index: any = [];
  // 存储需要特殊处理的“再数组中的开始位置变量索引
  let _indexStart: any = null;
  // 存储需要特殊处理的“再数组中的结束位置变量索引
  let _indexEnd: any = null;
  // 将jsonString字符串内容通过\r\n符分割成数组
  let jsonArray: any = [];
  // 正则匹配到{,}符号则在两边添加回车换行
  jsonString = jsonString.replace(/([\\{\\}])/g, "\r\n$1\r\n");
  // 正则匹配到[,]符号则在两边添加回车换行
  jsonString = jsonString.replace(/([\\[\]])/g, "\r\n$1\r\n");
  // 正则匹配到,符号则在两边添加回车换行
  jsonString = jsonString.replace(/(,)/g, "$1\r\n");
  // 正则匹配到要超过一行的换行需要改为一行
  jsonString = jsonString.replace(/(\r\n\r\n)/g, "\r\n");
  // 正则匹配到单独处于一行的,符号时需要去掉换行，将,置于同行
  jsonString = jsonString.replace(/\r\n\\,/g, ",");
  // 特殊处理双引号中的内容
  jsonArray = jsonString.split("\r\n");
  jsonArray.forEach(function (node: string, index: number) {
    // 获取当前字符串段中"的数量
    let num = 0;
    const nodeMatch = node.match(/\\"/g);
    if (nodeMatch) {
      num = nodeMatch.length;
    }

    // 判断num是否为奇数来确定是否需要特殊处理
    if (num % 2 && !_indexStart) {
      _indexStart = index;
    }
    if (num % 2 && _indexStart && _indexStart != index) {
      _indexEnd = index;
    }
    // 将需要特殊处理的字符串段的其实位置和结束位置信息存入，并对应重置开始时和结束变量
    if (_indexStart && _indexEnd) {
      _index.push({
        start: _indexStart,
        end: _indexEnd,
      });
      _indexStart = null;
      _indexEnd = null;
    }
  });
  // 开始处理双引号中的内容，将多余的"去除
  _index.reverse().forEach(function (item: any, index: number) {
    let newArray = jsonArray.slice(item.start, item.end + 1);
    jsonArray.splice(item.start, item.end + 1 - item.start, newArray.join(""));
  });
  // 奖处理后的数组通过\r\n连接符重组为字符串
  jsonString = jsonArray.join("\r\n");
  // 将匹配到:后为回车换行加大括号替换为冒号加大括号
  jsonString = jsonString.replace(/\\:\r\n\{/g, ":{");
  // 将匹配到:后为回车换行加中括号替换为冒号加中括号
  jsonString = jsonString.replace(/\\:\r\n\[/g, ":[");
  // 将上述转换后的字符串再次以\r\n分割成数组
  jsonArray = jsonString.split("\r\n");
  // 将转换完成的字符串根据PADDING值来组合成最终的形态
  jsonArray.forEach(function (item: string, index: number) {
    let i = 0;
    // 表示缩进的位数，以tab作为计数单位
    let indent = 0;
    // 表示缩进的位数，以空格作为计数单位
    let padding = "";
    if (item.match(/\{$/) || item.match(/\[$/)) {
      // 匹配到以{和[结尾的时候indent加1
      indent += 1;
    } else if (item.match(/\}$/) || item.match(/\]$/) || item.match(/\},$/) || item.match(/\],$/)) {
      // 匹配到以}和]结尾的时候indent减1
      if (pad !== 0) {
        pad -= 1;
      }
    } else {
      indent = 0;
    }
    for (i = 0; i < pad; i++) {
      padding += PADDING;
    }
    formatted += padding + item + "\r\n";
    pad += indent;
  });
  // 返回的数据需要去除两边的空格
  return formatted.trim();
}
