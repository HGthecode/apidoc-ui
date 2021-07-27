<template>
  <div>
    <h2>请求头Headers</h2>
    <div class="api-param-table mb">
      <Table
        :columns="headersColumns"
        size="small"
        rowKey="name"
        :bordered="true"
        :pagination="false"
        :data-source="headerData"
        :scroll="tableScroll"
      >
        <template #headerValue="{ text, record }">
          <TableInput
            :style="{ width: '340px' }"
            :data="text"
            @change="onHeaderCellChange(record.name, $event)"
          />
        </template>
      </Table>
    </div>
    <h2>请求参数Parameters</h2>
    <div class="mb-sm">
      <div v-if="detail.paramType === 'formdata' || detail.paramType === 'route'" class="param-box">
        <Table
          :columns="headersColumns"
          size="small"
          rowKey="name"
          :bordered="true"
          :pagination="false"
          :data-source="paramFormData"
          :scroll="tableScroll"
        >
          <template #headerValue="{ text, record }">
            <Upload
              v-if="record.type === 'file'"
              :file-list="fileData[record.name]"
              :remove="
                (file) => {
                  fileHandleRemove(file, record.name);
                }
              "
              :before-upload="
                (file) => {
                  fileBeforeUpload(file, record.name);
                  return false;
                }
              "
              :name="record.name"
            >
              <a-button> Select File </a-button>
            </Upload>
            <TableInput
              v-else
              :style="{ width: '350px' }"
              :data="text"
              @change="onParamCellChange(record.name, $event)"
            />
          </template>
        </Table>
      </div>
      <code-editor
        v-else
        :code="paramCode"
        @change="onParamCodeChange"
        title="请求参数Parameters"
      />
    </div>
    <div class="mb-sm">
      <a-button type="primary" :loading="loading" block @click="excute">执行 Excute</a-button>
    </div>
    <h2>响应结果Responses</h2>
    <div v-if="returnData && returnData.status" class="mb">
      <div class="mb-sm">
        <Alert
          :type="returnData.status >= 200 && returnData.status < 300 ? 'success' : 'error'"
          show-icon
        >
          <template #message>
            <b>{{ returnData.status }}</b>
            <span style="margin-left: 16px">{{
              returnData.message ? returnData.message : returnData.statusText
            }}</span>
          </template>
        </Alert>
      </div>
      <div v-if="returnData.data" class="api-param-code">
        <div v-if="returnString" class="string-code" v-html="returnString"></div>
        <code-editor
          v-else
          :code="formatJsonCode(returnData.data)"
          :readOnly="true"
          @change="onReturnCodeChange"
          title="请求参数Parameters"
        />
      </div>
    </div>
    <div v-else class="api-param-empty">
      <Empty :description="false" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType, watchEffect, toRefs, computed } from "vue";
import { ApiDetailState, ApiParamState, FileData, UploadFileState } from "./interface";
import { Table, Button, message, Form, Upload, Input, Alert, Empty } from "ant-design-vue";
import { cloneDeep } from "lodash";
import TableInput from "@/components/TableInput";
// import MonacoEditor from "@/components/MonacoEditor";
import CodeEditor from "@/components/CodeEditor";
import { renderCodeJsonByParams, formatJsonCode } from "@/utils/helper/codeHelper";
// import CodeHighlight from "@/components/CodeHighlight";
import Axios from "@/utils/http/index";
import { ObjectState } from "@/store/index";
import { useStore } from "vuex";
import { GlobalState } from "@/store";

export default defineComponent({
  components: {
    Table,
    TableInput,
    CodeEditor,
    [Button.name]: Button,
    Alert,
    Empty,
    // CodeHighlight,
    // Form,
    // FormItem: Form.Item,
    // Input,
    Upload,
  },
  props: {
    detail: {
      type: Object as PropType<ApiDetailState>,
      default: () => {
        return {
          menu_key: "",
          children: [],
        };
      },
    },
    currentMethod: {
      type: String as PropType<string>,
      default: "get",
    },
  },
  setup(props) {
    const store = useStore<GlobalState>();
    const headerData: ApiParamState[] = [];
    const fileData: FileData = {};
    const paramFormData: ApiParamState[] = [];
    // const returnData:
    const state = reactive({
      headerData: headerData,
      paramCode: "",
      returnCode: "",
      loading: false,
      currentParamCode: "",
      fileData: fileData,
      formdata: {},
      paramFormData: paramFormData,
      returnData: {},
      returnString: "",
      globalParams: computed(() => store.state.apidoc.globalParams),
    });
    const headersColumns = [
      {
        title: "Key",
        dataIndex: "name",
        width: 240,
      },
      {
        title: "Value",
        dataIndex: "default",
        width: 350,
        slots: {
          customRender: "headerValue",
        },
        // scopedSlots: { customRender: "headerValue" },
      },
      {
        title: "说明",
        dataIndex: "desc",
      },
    ];

    function renderHeaderData(headerData: ApiParamState[]) {
      const data = cloneDeep(headerData);
      if (data && data.length) {
        // 合并全局参数
        const globalParams = state.globalParams;
        if (globalParams && globalParams.header && globalParams.header.length) {
          return data.map((item) => {
            const globalParamFind = globalParams.header.find((p) => p.name === item.name);
            if (globalParamFind && globalParamFind.value) {
              item.default = globalParamFind.value;
            }
            return item;
          });
        } else {
          return data;
        }
      }

      return [];
    }

    watchEffect(() => {
      state.headerData = renderHeaderData(props.detail.header);
    });
    watchEffect(() => {
      const json = renderCodeJsonByParams(props.detail.param);
      state.paramCode = formatJsonCode(json);
      state.paramFormData = props.detail.param;
    });

    const tableScroll = {
      x: "700px",
      y: "100%",
    };

    function onHeaderCellChange(key: string, e: any) {
      const { value } = e.target;
      const dataSource = state.headerData;
      const target = dataSource.find((item) => item.name === key);
      if (target) {
        target.default = value;
        state.headerData = dataSource;
      }
    }

    function onParamCodeChange(code: string) {
      state.paramCode = code;
    }

    function excute() {
      let url = props.detail.url as string;
      if (props.detail.paramType == "formdata") {
        const formData = new FormData();
        state.paramFormData.forEach((item) => {
          if (item.type === "file") {
            const fileList = state.fileData[item.name];
            if (fileList && fileList.length) {
              formData.append(item.name, fileList[0]);
            }
          } else {
            const value: any = item.default;
            formData.append(item.name, value);
          }
        });
        sendRequest(url, formData);
      } else if (props.detail.paramType == "route") {
        // 路由参数，将参数拼接到url中
        state.paramFormData.forEach((item) => {
          const placeholderKeys = [
            `:${item.name}`,
            `<${item.name}>`,
            `<${item.name}?>`,
            `[:${item.name}]`,
          ];
          for (let i = 0; i < placeholderKeys.length; i++) {
            const key = placeholderKeys[i];
            if (url.indexOf(key) > -1) {
              const reg = new RegExp(key, "g");
              const value: any = item.default;
              url = url.replace(reg, value);
            }
          }
        });
        sendRequest(url);
      } else if (state.paramCode as string) {
        try {
          const paramJson = eval("(" + state.paramCode + ")");
          sendRequest(url, paramJson);
        } catch (error) {
          message.error("json 参数格式化错误");
        }
      }
    }

    function sendRequest(url: string, data?: any) {
      let method = props.currentMethod as string;
      if (method) {
        method = method.toLowerCase();
      }
      const headers: ObjectState = {};
      // 全局请求头参数
      const globalParams = state.globalParams;
      if (globalParams && globalParams.header && globalParams.header.length) {
        globalParams.header.forEach((item) => {
          headers[item.name] = item.value;
        });
      }
      // 合并全局请求参数
      if (globalParams && globalParams.params && globalParams.params.length) {
        globalParams.params.forEach((item) => {
          if (!data[item.name]) {
            data[item.name] = item.value;
          }
        });
      }
      if (state.headerData && state.headerData.length) {
        state.headerData.forEach((item) => {
          headers[item.name] = item.default;
        });
      }

      if (props.detail.paramType === "formdata") {
        headers[method] = {
          "Content-Type": "application/x-www-form-urlencoded",
        };

        // headers[method]["Content-Type"] = "application/x-www-form-urlencoded";
      }
      const json: any = {
        method,
        headers,
      };
      if (method == "get" && data) {
        json.params = data;
      } else if (data) {
        json.data = data;
      }

      state.loading = true;
      Axios(url, json)
        .then((res) => {
          state.loading = false;
          if (res.data && typeof res.data === "string") {
            state.returnString = res.data;
            state.returnData = res;
          } else {
            state.returnString = "";
            state.returnData = res;
          }
        })
        .catch((err) => {
          state.loading = false;
          if (err.response) {
            state.returnData = err.response;
          } else {
            state.returnData = {
              status: 500,
              message: err.message,
            };
          }
        });

      // const method = (props.detail.method as string) && props.detail.method.toLowerCase() : "";
    }

    function fileBeforeUpload(file: UploadFileState, name: string): void {
      state.fileData[name] = [file];
    }
    function fileHandleRemove(file: UploadFileState, name: string): void {
      let fileList = state.fileData[name];
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      state.fileData[name] = newFileList;
    }

    function onParamCellChange(key: string, e: any) {
      const { value } = e.target;
      const dataSource = state.paramFormData;
      const target = dataSource.find((item) => item.name === key);
      if (target) {
        target.default = value;
        state.paramFormData = dataSource;
      }
    }

    function onReturnCodeChange() {
      console.log("change");
    }

    return {
      ...toRefs(state),
      headersColumns,
      tableScroll,
      onHeaderCellChange,
      onParamCodeChange,
      excute,
      fileHandleRemove,
      fileBeforeUpload,
      onParamCellChange,
      formatJsonCode,
      onReturnCodeChange,
    };
  },
});
</script>

<style lang="less" scoped>
.api-param-empty {
  border: 1px solid var(--color-line);
  border-radius: 4px;
  padding: 16px;
}
</style>
