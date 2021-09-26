<template>
  <div>
    <div v-if="headerData && headerData.length">
      <Title :title="t('apiPage.title.header')" />
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
              :style="{ width: '100%' }"
              :data="text"
              @change="onHeaderCellChange(record.name, $event)"
            />
          </template>
        </Table>
      </div>
    </div>
    <div>
      <Title :title="t('apiPage.title.params')">
        <a-button @click="onMockReload">
          <ReloadOutlined />{{ t("apiPage.debug.mock.reload") }}
        </a-button>
      </Title>
      <div class="mb-sm">
        <div
          v-if="detail.paramType === 'formdata' || detail.paramType === 'route'"
          class="param-box"
        >
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
          :title="t('apiPage.title.params')"
        />
      </div>
    </div>
    <div class="mb-sm">
      <a-button type="primary" :loading="loading" block @click="excute">{{
        t("apiPage.debug.excute")
      }}</a-button>
    </div>

    <Title :title="t('apiPage.title.responses')">
      <EventPopover :title="t('apiPage.debug.event.before')" :eventData="eventData.before" />
      <EventPopover
        :title="t('apiPage.debug.event.after')"
        placement="bottomRight"
        :eventData="eventData.after"
      />
    </Title>
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
          @change="() => {}"
          :title="t('apiPage.title.responses')"
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
import { ApiDetailState, FileData, UploadFileState } from "../interface";
import { Table, Button, message, Upload, Alert, Empty } from "ant-design-vue";
import { ReloadOutlined } from "@ant-design/icons-vue";
import { before, cloneDeep, isArray } from "lodash";
import TableInput from "@/components/TableInput";
import CodeEditor from "@/components/CodeEditor";
import { renderCodeJsonByParams, formatJsonCode } from "@/utils/helper/codeHelper";
import Axios from "@/utils/http/index";
import { ObjectState } from "@/store/index";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import { ParamItem } from "@/api/interface/apiData";
import { handleRequestEvent, getEventMessage, ResultState } from "./handleEvent";
import { useI18n } from "@/hooks/useI18n";
import Title from "../Title.vue";
import EventPopover from "./EventPopover.vue";

interface EventDataState {
  before: ResultState;
  after: ResultState;
}

export default defineComponent({
  components: {
    Table,
    TableInput,
    CodeEditor,
    [Button.name]: Button,
    Alert,
    Empty,
    ReloadOutlined,
    Upload,
    Title,
    EventPopover,
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
    const headerData: ParamItem[] = [];
    const fileData: FileData = {};
    const paramFormData: ParamItem[] = [];
    const { t } = useI18n();

    let eventData: EventDataState = {
      before: {
        status: "default",
        list: [],
      },
      after: {
        status: "default",
        list: [],
      },
    };

    if (props.detail.before) {
      eventData.before.list = props.detail.before.map((p) => {
        return {
          status: "default",
          title: t(`apiPage.debug.event.${p.event}`),
          message: getEventMessage(p),
        };
      });
    }
    if (props.detail.after) {
      eventData.after.list = props.detail.after.map((p) => {
        return {
          status: "default",
          title: t(`apiPage.debug.event.${p.event}`),
          message: getEventMessage(p),
        };
      });
    }

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
      isMobile: computed(() => store.state.app.isMobile),
      eventData: eventData,
    });
    const headersColumns = [
      {
        title: "Key",
        dataIndex: "name",
        width: 200,
      },
      {
        title: "Value",
        dataIndex: "default",
        slots: {
          customRender: "headerValue",
        },
        // scopedSlots: { customRender: "headerValue" },
      },
      {
        title: t("common.desc"),
        dataIndex: "desc",
        width: 150,
      },
    ];

    function renderHeaderData(headerData: ParamItem[]) {
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
      if (props.detail.header) {
        state.headerData = renderHeaderData(props.detail.header);
      }
    });
    watchEffect(() => {
      if (props.detail.param) {
        const json = renderCodeJsonByParams(props.detail.param, true);
        state.paramCode = formatJsonCode(json);
        state.paramFormData = props.detail.param;
      }
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
        let params: any = {};
        state.paramFormData.forEach((item) => {
          const placeholderKeys = [
            `:${item.name}`,
            `<${item.name}>`,
            `<${item.name}?>`,
            `[:${item.name}]`,
          ];
          let isReplace = false;
          for (let i = 0; i < placeholderKeys.length; i++) {
            const key = placeholderKeys[i];
            if (url.indexOf(key) > -1) {
              const reg = new RegExp(key, "g");
              const value: any = item.default;
              url = url.replace(reg, value);
              isReplace = true;
            }
          }
          if (!isReplace) {
            params[item.name] = item.default;
          }
        });
        sendRequest(url, params);
      } else if (state.paramCode as string) {
        try {
          const paramJson = eval("(" + state.paramCode + ")");
          sendRequest(url, paramJson);
        } catch (error) {
          state.loading = false;
          message.error(t("apiPage.json.formatError"));
        }
      }
    }

    async function sendRequest(url: string, data?: any) {
      state.loading = true;
      let method = props.currentMethod as string;
      if (method) {
        method = method.toLowerCase();
      }
      const headers: ObjectState = {};
      // 全局请求头参数
      const globalParams = state.globalParams;
      if (globalParams && globalParams.header && globalParams.header.length) {
        globalParams.header.forEach((item) => {
          if (item.name && item.value) {
            headers[item.name] = item.value;
          }
        });
      }
      // 合并全局请求参数
      if (data && globalParams && globalParams.params && globalParams.params.length) {
        globalParams.params.forEach((item) => {
          if (!data[item.name]) {
            data[item.name] = item.value;
          }
        });
      }
      if (state.headerData && state.headerData.length) {
        state.headerData.forEach((item) => {
          if (item.name && item.default) {
            headers[item.name] = item.default;
          }
        });
      }

      if (props.detail.paramType === "formdata") {
        headers[method] = {
          "Content-Type": "application/x-www-form-urlencoded",
        };
      }
      let json: any = {
        method,
        headers,
        params: data,
      };

      // 执行前置方法
      if (props.detail.before && props.detail.before.length) {
        const beforeEvent = await handleRequestEvent(props.detail.before, json, store);
        if (beforeEvent.list && beforeEvent.list.length) {
          const hasError = beforeEvent.list.filter((p: any) => p.status === "error");
          json = beforeEvent.json;
          state.eventData.before = {
            status: hasError && hasError.length ? "error" : "success",
            list: beforeEvent.list,
          };
          if (hasError && hasError.length) {
            state.loading = false;
            return false;
          }
        }
      }
      if (method != "get" && json.params) {
        json.data = json.params;
        delete json.params;
      }
      Axios(url, json)
        .then((res) => {
          // 执行后置方法
          if (props.detail.after && props.detail.after.length) {
            handleRequestEvent(props.detail.after, json, store, res).then((afterEvent) => {
              state.eventData.after = {
                status: "success",
                list: afterEvent.list,
              };
            });
          }
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

    function onMockReload() {
      if (props.detail.param) {
        const json = renderCodeJsonByParams(props.detail.param, true);
        state.paramCode = formatJsonCode(json);
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
      formatJsonCode,
      onMockReload,
      t,
    };
  },
});
</script>

<style lang="less" scoped>
@import "./debug.less";
</style>
