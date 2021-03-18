import cloneDeep from "lodash/cloneDeep";

/**
 * 去除字符串首尾空格
 * @param {string} s
 */
export const trim = s => {
  if (s) {
    return s.replace(/(^\s*)|(\s*$)/g, "");
  }
  return "";
};

/**
 * 获取指定数量的空格
 * @param {int} indent
 */
export const getIndent = indent => {
  let string = "";
  for (let i = 0; i < indent; i++) {
    string += "\xa0";
  }
  return string;
};

/**
 * 根据参数生成json字符串
 * @param {array}} params
 * @param {int} indent
 * @param {*} notes
 */
export const renderParamsCode = (params, indent = 0, notes) => {
  const indentContent = getIndent(indent);
  const valueIndentContent = getIndent(indent + 2);

  let code = indentContent + "{\n";
  if (indent > 0) {
    code = "";
  }

  if (params && params.length) {
    params.forEach(item => {
      let stringValue = item.default ? item.default : item.type;
      let value = `"${trim(stringValue)}"`;
      let type = "string";
      let noteText = "";
      if (notes) {
        noteText = "//" + item.desc + "";
      }

      if (item.type == "object" && item.params && item.params.length) {
        let arrayCode = indentContent + "{    " + noteText + "\n";
        arrayCode += renderParamsCode(item.params, indent + 2, notes);
        arrayCode += valueIndentContent + "},\n";
        value = arrayCode;

        type = "object";
      } else if (item.type == "array" && item.params && item.params.length) {
        let arrayCode = indentContent + "[    " + noteText + "\n";
        arrayCode += valueIndentContent + "{\n";
        arrayCode += renderParamsCode(item.params, indent + 2, notes);
        arrayCode += valueIndentContent + "}\n";
        arrayCode += valueIndentContent + "],\n";
        value = arrayCode;
        type = "array";
      }
      let desc = "";
      if (!(type === "array" || type == "object") && notes) {
        desc = `,  // ${item.desc}\n`;
      }
      code += `${valueIndentContent}${item.name}: ${value}${desc}`;
    });
  }
  if (indent == 0) {
    code += indentContent + "}\n";
  }
  return code;
};

/**
 * 设置当前Url
 * @param {string} url
 */
export const setCurrentUrl = url => {
  window.history.replaceState(
    {
      path: url
    },
    "",
    url
  );
};

/**
 * 获取当前url参数
 */
export const getUrlQuery = () => {
  const query = window.location.search.substring(1);
  const vars = query.split("&");
  let values = {};
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split("=");
    values[pair[0]] = pair[1];
  }
  return values;
};

export const treeTransArray = (tree, key) => {
  return [].concat(
    ...tree.map(item => {
      if (item[key] && item[key].length) {
        const currentItem = cloneDeep(item);
        delete currentItem[key];
        return [].concat(currentItem, ...treeTransArray(item[key], key));
      } else {
        return item;
      }
    })
  );
};

export const getTreeMaxlevel = (treeData, childrenField = "children") => {
  // let level = 0;
  // let v = this;
  let maxLevel = 0;
  function loop(data, level) {
    data.forEach(item => {
      item.level = level;
      if (level > maxLevel) {
        maxLevel = level;
      }
      if (childrenField in item) {
        if (item[childrenField].length > 0) {
          loop(item[childrenField], level + 1);
        }
      }
    });
  }
  loop(treeData, 1);
  return maxLevel;
};

export const getTreeFirstNode = (tree, childrenField = "children") => {
  var temp = [];
  var forFn = function(arr) {
    if (arr && arr.length > 0) {
      temp.push(arr[0]);
      if (arr[0][childrenField]) {
        forFn(arr[0][childrenField]);
      }
    }
  };
  forFn(tree);
  return temp;
};

/**
 * 将文本内的特殊标记替换成html
 * @param {string} text
 * @returns
 */
export const textToHtml = text => {
  return text ? text.replace(/ /g, "&nbsp;").replace(/\r\n/g, "<br>") : "";
};
