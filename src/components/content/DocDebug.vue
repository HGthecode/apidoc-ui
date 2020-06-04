<template>
  <div class="doc-content">
    <div v-if="headerData && headerData.length">
      <h2>请求头Headers</h2>
      <div class="api-param-table">
        <Table
          :columns="headersColumns"
          size="small"
          rowKey="name"
          :bordered="true"
          :pagination="false"
          :data-source="headerData"
        >
          <template slot="headerValue" slot-scope="text">
            <TableInput style="width:350px;" :data="text" />
          </template>
        </Table>
      </div>
    </div>
    <div v-if="apiData.param && apiData.param.length">
      <h2>请求参数Parameters</h2>
      <div class="api-param-textarea">
        <TextArea
          v-model="parameters"
          :auto-size="{ minRows: 5, maxRows: 20 }"
        />
      </div>
    </div>

    <div class="api-debug-action">
      <Button type="primary" block @click="excute">执行 Excute</Button>
    </div>

    <div>
      <h2>响应结果Responses</h2>
      <div v-if="returnData && returnData.status" class="api-param-table">
        <Alert
          v-if="returnData.status == 200"
          :message="returnData.status"
          type="success"
          show-icon
        />
        <Alert v-else :message="returnData.status" type="error" show-icon />
        <div class="api-param-code">
          <div class="code">
            <highlight-code lang="javascript">
              {{ returnData.data }}
            </highlight-code>
          </div>
        </div>
      </div>
      <div v-else class="api-param-empty">
        <Empty :description="false" />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { Input, Button, Alert, Empty, Table } from "ant-design-vue";
import VueHighlightJS from "vue-highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import { sendRequest } from "../utils/request";
import { trim, getIndent } from "../utils/utils";
import TableInput from "../utils/Input";
import cloneDeep from "lodash/cloneDeep";
import { ls } from "../utils/cache";
Vue.use(VueHighlightJS, {
  languages: {
    javascript,
    json
  }
});

export default {
  components: {
    TextArea: Input.TextArea,
    Button,
    Alert,
    Empty,
    Table,
    TableInput
  },
  props: {
    apiData: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      returnData: {},
      parameters: "",
      headersColumns: [
        {
          title: "Key",
          dataIndex: "name",
          width: 180
        },
        {
          title: "Value",
          dataIndex: "default",
          width: 350,
          scopedSlots: { customRender: "headerValue" }
        },
        {
          title: "说明",
          dataIndex: "desc"
        }
      ],
      headerData: []
    };
  },
  watch: {
    apiData() {
      this.parameters = this.renderParamsCode(this.apiData.param);
      this.returnData = {};
      this.headerData = this.renderHeaderData(this.apiData.header);
    }
  },

  created() {
    this.parameters = this.renderParamsCode(this.apiData.param);
    this.headerData = this.renderHeaderData(this.apiData.header);
  },
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
            let arrayCode = indentContent + "{\n";
            arrayCode += this.renderParamsCode(item.params, indent + 2);
            arrayCode += valueIndentContent + "},\n";
            value = arrayCode;
            type = "object";
          } else if (
            item.type == "array" &&
            item.params &&
            item.params.length
          ) {
            let arrayCode = indentContent + "[\n";
            arrayCode += valueIndentContent + "{\n";
            arrayCode += this.renderParamsCode(item.params, indent + 2);
            arrayCode += valueIndentContent + "}\n";
            arrayCode += valueIndentContent + "],\n";
            value = arrayCode;
            type = "array";
          }
          let desc = `,\n`;
          if (type === "array" || type == "object") {
            desc = "";
          }
          code += `${valueIndentContent}"${item.name}": ${value}${desc}`;
        });
      }
      if (indent == 0) {
        code += indentContent + "}\n";
      }
      return code;
    },

    excute() {
      const string = this.parameters;
      var json = eval("(" + string + ")");
      const method = this.apiData.method.toLowerCase();
      const headers = {};
      if (this.headerData && this.headerData.length) {
        this.headerData.forEach(item => {
          headers[item.name] = item.default;
        });
      }
      if (this.globalAuthToken) {
        headers[this.globalAuthKey] = this.globalAuthToken;
      }
      sendRequest(this.apiData.url, json, method, headers)
        .then(res => {
          this.returnData = res;
        })
        .catch(err => {
          if (err.response) {
            this.returnData = err.response;
          } else {
            this.returnData = {
              status: 500
            };
          }
        });
    },
    renderHeaderData(headerData) {
      const data = cloneDeep(headerData);
      // 赋值全局Auth
      this.globalAuthKey =
        this.config && this.config.global_auth_key
          ? this.config.global_auth_key
          : "Authorization";
      this.globalAuthToken = ls.get("globalAuth");
      const headers = data.map(item => {
        if (item.name === this.globalAuthKey) {
          item.default = this.globalAuthToken;
        }
        return item;
      });
      return headers;
    }
  }
};
</script>

<style lang="less" scoped>
.api-param-textarea textarea {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
    monospace;
}
.api-debug-action {
  padding: 16px 0;
}
.api-param-code {
  margin-top: 16px;
}
.api-param-empty {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
}
.api-param-table {
  margin-bottom: 16px;
}
/deep/
  .ant-table-small
  > .ant-table-content
  > .ant-table-body
  > table
  > .ant-table-thead
  > tr
  > th {
  background: #fafafa;
  font-weight: 600;
}
/deep/ .ant-table-small > .ant-table-content > .ant-table-body {
  margin: 0;
}
</style>
