<template>
  <div>
    <div v-if="headerData && headerData.length">
      <Title :title="t('apiPage.title.header')" />
      <div class="api-param-table mb-sm">
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
        <a-button v-if="isMock" @click="onMockReload">
          <ReloadOutlined />{{ t("apiPage.debug.mock.reload") }}
        </a-button>
      </Title>
      <div class="mb-sm">
        <div v-if="detail.paramType === 'formdata'" class="param-box">
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
                v-if="record.type === 'file' || record.type === 'files'"
                :multiple="record.type === 'files'"
                :file-list="fileData[record.name]"
                :remove="
                  (file) => {
                    fileHandleRemove(file, record.name);
                  }
                "
                :before-upload="
                  (file) => {
                    fileBeforeUpload(file, record);
                    return false;
                  }
                "
                :name="record.name"
              >
                <a-button>{{
                  record.type === "files"
                    ? t("apiPage.debug.selectFiles")
                    : t("apiPage.debug.selectFile")
                }}</a-button>
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
    <div class="excute-buttons">
      <a-button v-if="isMock" type="primary" :loading="loading" block @click="mockAndExcute">{{
        t("apiPage.debug.mockAndExcute")
      }}</a-button>
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
    <div v-if="returnData && returnData.status" class="mb-sm">
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
import { defineComponent, reactive, PropType, watchEffect, toRefs, computed, watch } from "vue";
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
import { getAppsConfigItemByKey } from "@/utils";
import { ConfigAppItem } from "@/api/interface/config";
import { useRoute } from "vue-router";
import Mock from "mockjs";
import "@/utils/helper/mockExtend";

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

    const route = useRoute();

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
      appKey: computed(() => {
        if (route.query.appKey) {
          return route.query.appKey;
        }
        return store.state.app.appKey;
      }),
      config: computed(() => store.state.app.config),
      eventData: eventData,
      feConfig: computed(() => store.state.app.feConfig),
      isMock: false,
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
        if (globalParams && globalParams.headers && globalParams.headers.length) {
          return data.map((item) => {
            const globalParamFind = globalParams.headers.find((p) => {
              if (
                p.name === item.name &&
                (!p.appKey || p.appKey === "global" || p.appKey === state.appKey)
              ) {
                return true;
              }
              return false;
            });
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

    watch(
      () => props.detail.header,
      () => {
        state.headerData = renderHeaderData(props.detail.header as ParamItem[]);
      }
    );
    state.headerData = renderHeaderData(props.detail.header as ParamItem[]);

    watchEffect(() => {
      if (props.detail.param) {
        const paramFormData = handleParamData(props.detail.param);
        if (props.detail.paramType === "formdata") {
          state.paramFormData = paramFormData;
        } else {
          const json = renderCodeJsonByParams(paramFormData, true);
          state.paramCode = formatJsonCode(json);
        }
      }
    });

    function handleParamData(paramData: ParamItem[]): ParamItem[] {
      const data = cloneDeep(paramData);
      let isMock = false;
      let res: ParamItem[] = [];
      if (data && data.length) {
        // 合并全局参数
        const globalParams = state.globalParams;
        if (globalParams && globalParams.params && globalParams.params.length) {
          res = data.map((item) => {
            const globalParamFind = globalParams.params.find(
              (p) =>
                p.name === item.name &&
                (!p.appKey || p.appKey === "global" || p.appKey === state.appKey)
            );
            if (globalParamFind && globalParamFind.value) {
              item.default = globalParamFind.value;
            }
            if (item.mock) {
              isMock = true;
            }
            return item;
          });
        } else {
          res = data.map((item) => {
            if (item.mock) {
              isMock = true;
              item.default = Mock.mock(item.mock);
            }
            return item;
          });
        }
      }
      state.isMock = isMock;
      return res;
    }

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

    function replaceRouteParam(url: string, key: string, value: any) {
      const placeholderKeys = [`:${key}`, `<${key}>`, `<${key}?>`, `[:${key}]`, `{${key}}`];
      let isReplace = false;
      for (let i = 0; i < placeholderKeys.length; i++) {
        const key = placeholderKeys[i];
        if (url.indexOf(key) > -1) {
          const reg = new RegExp(key, "g");
          url = url.replace(reg, value);
          isReplace = true;
        }
      }

      return {
        url,
        isReplace,
      };
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
          } else if (item.type === "files") {
            const fileList = state.fileData[item.name];
            if (fileList && fileList.length) {
              for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                formData.append(`${item.name}[]`, file);
              }
            }
          } else {
            const routeData = replaceRouteParam(url, item.name, item.default);
            url = routeData.url;
            if (!routeData.isReplace) {
              const value: any = item.default;
              formData.append(item.name, value);
            }
          }
        });
        sendRequest(url, formData);
      } else if (state.paramCode as string) {
        try {
          const paramJson = eval("(" + state.paramCode + ")");
          let json: any = {};
          for (const key in paramJson) {
            const value = paramJson[key];
            const routeData = replaceRouteParam(url, key, value);
            url = routeData.url;
            if (!routeData.isReplace) {
              json[key] = value;
            }
          }
          sendRequest(url, json);
        } catch (error) {
          state.loading = false;
          message.error(t("apiPage.json.formatError"));
        }
      }
    }

    function mockAndExcute() {
      onMockReload();
      setTimeout(() => {
        excute();
      }, 200);
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
      if (globalParams && globalParams.headers && globalParams.headers.length) {
        globalParams.headers.forEach((item) => {
          if (
            item.name &&
            item.value &&
            (!item.appKey || item.appKey === "global" || item.appKey === state.appKey)
          ) {
            headers[item.name] =
              state.feConfig.HTTP.HEADERS_ENCODEURICOMPONENT !== false
                ? encodeURIComponent(item.value)
                : item.value;
          }
        });
      }
      // 合并全局请求参数
      if (data && globalParams && globalParams.params && globalParams.params.length) {
        globalParams.params.forEach((item) => {
          if (
            !data[item.name] &&
            (!item.appKey || item.appKey === "global" || item.appKey === state.appKey)
          ) {
            data[item.name] = item.value;
          }
        });
      }
      if (state.headerData && state.headerData.length) {
        state.headerData.forEach((item) => {
          if (item.name && item.default) {
            headers[item.name] =
              state.feConfig.HTTP.HEADERS_ENCODEURICOMPONENT !== false
                ? encodeURIComponent(item.default)
                : item.default;
          }
        });
      }

      if (props.detail.paramType === "formdata") {
        headers["content-type"] = "application/x-www-form-urlencoded";
      }
      if (props.detail.contentType) {
        headers["content-type"] = props.detail.contentType;
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
      const appConfig = getAppsConfigItemByKey(
        state.config.apps as ConfigAppItem[],
        state.appKey as string
      );
      if (appConfig && appConfig.host) {
        json.baseURL = appConfig.host;
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
              status: 404,
              message: err.message,
            };
          }
        });

      // const method = (props.detail.method as string) && props.detail.method.toLowerCase() : "";
    }

    function fileBeforeUpload(file: UploadFileState, record: ParamItem): void {
      if (
        record.type === "files" &&
        state.fileData[record.name] &&
        state.fileData[record.name].length
      ) {
        state.fileData[record.name].push(file);
      } else {
        state.fileData[record.name] = [file];
      }
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
        if (props.detail.paramType === "formdata" || props.detail.paramType === "route") {
          state.paramFormData = props.detail.param.map((p) => {
            if (p.mock) {
              p.default = Mock.mock(p.mock);
            }
            return p;
          });
        } else {
          const json = renderCodeJsonByParams(props.detail.param, true);
          state.paramCode = formatJsonCode(json);
        }
      }
      // if (props.detail.param) {
      //   const json = renderCodeJsonByParams(props.detail.param, true);
      //   state.paramCode = formatJsonCode(json);
      // }
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
      mockAndExcute,
    };
  },
});
</script>

<style lang="less" scoped>
@import "./debug.less";
</style>
