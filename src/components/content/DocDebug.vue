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
          :scroll="tableScroll"
        >
          <template slot="headerValue" slot-scope="text, record">
            <TableInput
              :style="{ width: device == 'mobile' ? '200px' : '350px' }"
              :data="text"
              @change="onHeaderCellChange(record.name, 'default', $event)"
            />
          </template>
        </Table>
      </div>
    </div>
    <div v-if="apiData.param && apiData.param.length">
      <h2>请求参数Parameters</h2>
      <div class="api-param-textarea">
        <div v-if="apiData.paramType === 'formdata'" class="param-box">
          <Form :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
            <FormItem
              v-for="item in apiData.param"
              :key="item.name"
              :label="item.name"
            >
              <div v-if="item.type == 'file'">
                <Upload
                  :file-list="fileList[item.name]"
                  :remove="
                    file => {
                      fileHandleRemove(file, item.name);
                    }
                  "
                  :before-upload="
                    file => {
                      fileBeforeUpload(file, item.name);
                      return false;
                    }
                  "
                  :name="item.name"
                >
                  <Button> Select File </Button>
                </Upload>
              </div>
              <Input v-else v-model="formdata[item.name]" />
            </FormItem>
          </Form>
        </div>
        <TextArea
          v-else
          v-model="parameters"
          :auto-size="{ minRows: 5, maxRows: 20 }"
        />
      </div>
    </div>

    <div class="api-debug-action">
      <Button type="primary" :loading="loading" block @click="excute"
        >执行 Excute</Button
      >
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
            <div
              v-if="returnString"
              class="string-code"
              v-html="returnString"
            ></div>
            <highlight-code v-else lang="javascript">
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
import {
  Input,
  Button,
  Alert,
  Empty,
  Table,
  Form,
  Upload
} from "ant-design-vue";
import VueHighlightJS from "vue-highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import { sendRequest } from "@/utils/request";
import { trim, getIndent } from "@/utils/utils";
import TableInput from "@/utils/Input";
import cloneDeep from "lodash/cloneDeep";
import { ls } from "@/utils/cache";
Vue.use(VueHighlightJS, {
  languages: {
    javascript,
    json
  }
});

export default {
  components: {
    Input,
    TextArea: Input.TextArea,
    Button,
    Alert,
    Empty,
    Table,
    TableInput,
    Form,
    FormItem: Form.Item,
    Upload
  },
  props: {
    apiData: {
      type: Object,
      default: () => {}
    },
    device: {
      type: String,
      default: "xl"
    }
  },

  data() {
    return {
      returnString: "",
      returnData: {},
      parameters: "",
      headersColumns: [
        {
          title: "Key",
          dataIndex: "name",
          width: 150
        },
        {
          title: "Value",
          dataIndex: "default",
          width: this.device == "mobile" ? 150 : 350,
          scopedSlots: { customRender: "headerValue" }
        },
        {
          title: "说明",
          dataIndex: "desc"
        }
      ],
      headerData: [],
      fileList: {},
      formdata: {},
      loading: false,
      tableScroll: {
        x: "600px",
        y: "100%"
      },
      config: {}
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
    this.config = ls.get("config");

    if (this.apiData.paramType == "formdata") {
      let fileList = {};
      let formdata = {};
      this.apiData.param.forEach(item => {
        if (item.type === "file") {
          fileList[item.name] = [];
        } else {
          formdata[item.name] = "";
        }
      });
      this.fileList = fileList;
      this.formdata = formdata;
    }
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
          } else if (item.type == "tree" && item.params && item.params.length) {
            let arrayCode = indentContent + "[\n";
            arrayCode += valueIndentContent + "{\n";
            arrayCode += this.renderParamsCode(item.params, indent + 4);
            arrayCode += valueIndentContent + "}\n";
            arrayCode += valueIndentContent + "],\n";
            value = arrayCode;
            type = "tree";
          }
          let desc = `,\n`;
          if (type === "array" || type == "object" || type == "tree") {
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
      const that = this;
      this.loading = true;
      let json = {};
      if (this.apiData.paramType == "formdata") {
        const formData = new FormData();
        this.apiData.param.forEach(item => {
          if (item.type === "file") {
            const fileList = this.fileList[item.name];
            if (fileList && fileList.length) {
              formData.append(item.name, fileList[0]);
            }
          } else {
            formData.append(item.name, this.formdata[item.name]);
          }
        });
        json = formData;
      } else {
        const string = this.parameters;
        json = eval("(" + string + ")");
      }

      const method = this.apiData.method.toLowerCase();
      const headers = {};
      this.globalAuthToken = ls.get("globalAuth");
      if (this.globalAuthToken) {
        headers[this.globalAuthKey] = this.globalAuthToken;
      }
      if (this.headerData && this.headerData.length) {
        this.headerData.forEach(item => {
          headers[item.name] = item.default;
        });
      }
      if (this.apiData.paramType === "formdata") {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      }

      sendRequest(this.apiData.url, json, method, headers)
        .then(res => {
          this.loading = false;
          if (res.data && typeof res.data === "string") {
            that.returnString = res.data;
            that.returnData = res;
          } else {
            that.returnString = "";
            that.returnData = res;
          }
        })
        .catch(err => {
          this.loading = false;
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
      if (data && data.length) {
        const headers = data.map(item => {
          if (item.name === this.globalAuthKey) {
            item.default = this.globalAuthToken;
          }
          return item;
        });
        return headers;
      }
      return [];
    },
    onHeaderCellChange(key, dataIndex, value) {
      const dataSource = [...this.headerData];
      const target = dataSource.find(item => item.name === key);
      if (target) {
        target[dataIndex] = value;
        this.headerData = dataSource;
      }
    },
    fileBeforeUpload(file, name) {
      // const fileList =
      //   this.fileList[name] && this.fileList[name].length
      //     ? this.fileList[name]
      //     : [];

      this.fileList[name] = [file];

      return false;
    },
    fileHandleRemove(file, name) {
      let fileList = this.fileList[name];
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      this.fileList[name] = newFileList;
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
.string-code {
  display: block;
  overflow-x: auto;
  padding: 0.5em;
  color: #abb2bf;
  background: #282c34;
  border-radius: 4px;
}
</style>
