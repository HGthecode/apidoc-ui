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
