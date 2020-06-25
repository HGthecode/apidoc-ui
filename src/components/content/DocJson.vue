<template>
  <div class="doc-content">
    <div v-if="apiData.param && apiData.param.length">
      <h2>请求参数Parameters</h2>
      <div class="api-param-code">
        <div class="code">
          <highlight-code lang="javascript">
            {{ paramCode }}
          </highlight-code>
        </div>
      </div>
    </div>

    <h2>
      响应结果Responses
      <Popover title="统一响应体">
        <template slot="content">
          <textarea
            class="code-textarea"
            cols="30"
            rows="8"
            readonly
            v-model="responses"
          ></textarea>
          <div class="note-text">
            <span style="color:#f00;">*</span>以下只展示业务数据内容
          </div>
        </template>
        <Icon
          style="float:right;color:#999;font-size:18px;"
          type="question-circle"
        />
      </Popover>
    </h2>
    <div class="api-param-table">
      <div class="api-param-code">
        <div class="code">
          <highlight-code lang="javascript">
            {{ returnCode }}
          </highlight-code>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";

import VueHighlightJS from "vue-highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import { trim, getIndent } from "../utils/utils";
import { Popover, Icon } from "ant-design-vue";

Vue.use(VueHighlightJS, {
  languages: {
    javascript,
    json
  }
});

export default {
  components: {
    Popover,
    Icon
  },
  props: {
    apiData: {
      type: Object,
      default: () => {}
    },
    responses: {
      type: String,
      default: ""
    }
  },
  computed: {
    paramCode() {
      const code = this.renderParamsCode(this.apiData.param, 0, true);
      return code;
    },
    returnCode() {
      const code = this.renderParamsCode(this.apiData.return, 0, true);
      return code;
    }
  },
  data() {
    return {};
  },

  created() {},
  methods: {
    renderParamsCode(params, indent = 0) {
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

          if (item.type == "object" && item.params && item.params.length) {
            let arrayCode = indentContent + "{    //" + item.desc + "\n";
            arrayCode += this.renderParamsCode(item.params, indent + 2);
            arrayCode += valueIndentContent + "},\n";
            value = arrayCode;

            type = "object";
          } else if (
            item.type == "array" &&
            item.params &&
            item.params.length
          ) {
            let arrayCode = indentContent + "[    //" + item.desc + "\n";
            arrayCode += valueIndentContent + "{\n";
            arrayCode += this.renderParamsCode(item.params, indent + 2);
            arrayCode += valueIndentContent + "}\n";
            arrayCode += valueIndentContent + "],\n";
            value = arrayCode;
            type = "array";
          } else if (item.type == "tree" && item.params && item.params.length) {
            let arrayCode = indentContent + "[    //" + item.desc + "\n";
            arrayCode += valueIndentContent + "{\n";
            arrayCode += this.renderParamsCode(item.params, indent + 4);
            arrayCode += valueIndentContent + "}\n";
            arrayCode += valueIndentContent + "],\n";
            value = arrayCode;
            type = "tree";
          }
          let desc = `,  // ${item.desc}\n`;
          if (type === "array" || type == "object" || type === "tree") {
            desc = "";
          }
          code += `${valueIndentContent}${item.name}: ${value}${desc}`;
        });
      }
      if (indent == 0) {
        code += indentContent + "}\n";
      }
      return code;
    }
  }
};
</script>

<style lang="less" scoped>
.code-textarea,
.code-textarea:focus {
  border: none;
  resize: none;
}
.note-text {
  color: #999;
  font-size: 14px;
  border-top: 1px solid #ddd;
  padding-top: 5px;
}
.api-param-code {
  margin-top: 16px;
  max-height: 500px;
  overflow: auto;
  .code {
    margin-bottom: 1em;
    pre {
      margin-bottom: 0;
      border-radius: 4px;
    }
  }
}
</style>
