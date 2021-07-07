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
            :style="{ width: '350px' }"
            :data="text"
            @change="onHeaderCellChange(record.name, $event)"
          />
        </template>
      </Table>
    </div>
    <h2>请求参数Parameters</h2>
    <div class="mb">
      <div v-if="detail.paramType === 'formdata' || detail.paramType === 'route'" class="param-box">
        <!-- <Form :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <FormItem v-for="item in detail.param" :key="item.name" :label="item.name">
            <div v-if="item.type == 'file'">
              <Upload
                :file-list="fileList[item.name]"
                :remove="
                  (file) => {
                    fileHandleRemove(file, item.name);
                  }
                "
                :before-upload="
                  (file) => {
                    fileBeforeUpload(file, item.name);
                    return false;
                  }
                "
                :name="item.name"
              >
                <a-button> Select File </a-button>
              </Upload>
            </div>
            <Input v-else v-model="formdata[item.name]" />
          </FormItem>
        </Form> -->
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
            <TableInput
              :style="{ width: '350px' }"
              :data="text"
              @change="onParamCellChange(record.name, $event)"
            />
          </template>
        </Table>
      </div>
      <monaco-editor v-else :code="paramCode" @change="onParamCodeChange" />
    </div>
    <div class="mb">
      <a-button type="primary" :loading="loading" block @click="excute">执行 Excute</a-button>
    </div>
    <h2>响应结果Responses</h2>
    <div class="mb"> </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType, watchEffect, toRefs } from "vue";
import { ApiDetailState, ApiParamState, FileData, UploadFileState } from "./interface";
import { Table, Button, message, Form, Upload, Input } from "ant-design-vue";
import { cloneDeep } from "lodash";
import TableInput from "@/components/TableInput";
import MonacoEditor from "@/components/MonacoEditor";
import { renderCodeJsonByParams, formatJson } from "@/utils/helper/codeHelper";

export default defineComponent({
  components: {
    Table,
    TableInput,
    MonacoEditor,
    [Button.name]: Button,
    // Form,
    // FormItem: Form.Item,
    // Input,
    // Upload,
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
  },
  setup(props) {
    const headerData: ApiParamState[] = [];
    const fileData: FileData = {};
    const paramFormData: ApiParamState[] = [];
    const state = reactive({
      headerData: headerData,
      paramCode: "",
      returnCode: "",
      loading: false,
      currentParamCode: "",
      fileData: fileData,
      formdata: {},
      paramFormData: paramFormData,
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

    // const headerData = renderHeaderData(props.detail.header);
    // console.log(headerData);

    function renderHeaderData(headerData: ApiParamState[]) {
      const data = cloneDeep(headerData);
      if (data && data.length) {
        // const globalParams = ls.get("globalParams");
        // if (
        //   globalParams &&
        //   globalParams.headers &&
        //   globalParams.headers.length
        // ) {
        //   return data.map(item => {
        //     const globalParamFind = globalParams.headers.find(
        //       p => p.key === item.name
        //     );
        //     if (globalParamFind && globalParamFind.value) {
        //       item.default = globalParamFind.value;
        //     }
        //     return item;
        //   });
        // } else {
        //   return data;
        // }
        return data;
      }

      return [];
    }

    watchEffect(() => {
      state.headerData = renderHeaderData(props.detail.header);
    });
    watchEffect(() => {
      const json = renderCodeJsonByParams(props.detail.param);
      state.paramCode = formatJson(json);
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
      state.currentParamCode = code;
    }

    function excute() {
      console.log("excute");
      if (props.detail.paramType == "formdata") {
        console.log(state.paramFormData);
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
        console.log(formData);
      } else if (state.currentParamCode as string) {
        try {
          const paramJson = eval("(" + state.currentParamCode + ")");
          console.log(paramJson);
        } catch (error) {
          console.log(error);
          message.error("json 参数格式化错误");
        }

        // state.loading = true;
        // setTimeout(() => {
        //   state.loading = false;
        // }, 2000);
      }
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
    };
  },
});
</script>
