<template>
  <div class="api-table">
    <div class="desc">
      <div v-if="detail.desc" v-html="textToHtml(detail.desc)"> </div>
      <markdown v-if="detail.md" :md="detail.md" />
    </div>
    <div v-if="detail.header && detail.header.length">
      <h2>请求头Headers</h2>
      <div class="api-param-table">
        <Table
          :columns="paramsColumns"
          size="small"
          rowKey="name"
          :scroll="tableScroll"
          :bordered="true"
          :pagination="false"
          :data-source="detail.header"
          childrenColumnName="children"
        >
        </Table>
      </div>
    </div>
    <div v-if="detail.param && detail.param.length">
      <h2>请求参数Parameters</h2>
      <div class="api-param-table">
        <Table
          :columns="paramsColumns"
          size="small"
          :rowKey="renterRowKey"
          :bordered="true"
          :pagination="false"
          :data-source="detail.param"
          :scroll="tableScroll"
          defaultExpandAllRows
          childrenColumnName="children"
        >
          <template #requireCell="{ text }">
            <CheckOutlined v-if="text" />
          </template>
          <template #rowDesc="{ text, record }">
            <div>
              <span v-html="textToHtml(text)"></span>&nbsp;&nbsp;
              <a v-if="record.md || record.mdRef" @click="onShowMdDetail(record)">查看</a>
            </div>
          </template>
        </Table>
      </div>
    </div>

    <div v-if="detail.return && detail.return.length">
      <h2> 响应结果Responses </h2>
      <div class="api-param-table">
        <Table
          :columns="returnColumns"
          size="small"
          :rowKey="renterRowKey"
          :bordered="true"
          :pagination="false"
          :data-source="detail.return"
          :scroll="tableScroll"
          defaultExpandAllRows
          childrenColumnName="children"
        >
        </Table>
      </div>
    </div>
    <markdown-modal ref="markdownModalRef" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType, toRefs, ref, unref } from "vue";
import { ApiDetailState, ApiParamState } from "./interface";
import { Table } from "ant-design-vue";
import { CheckOutlined } from "@ant-design/icons-vue";
import { textToHtml } from "@/utils";
import MarkdownModal from "@/components/Markdown/Modal.vue";
import { ParamItem } from "@/api/interface/apiData";
import Markdown from "@/components/Markdown/Markdown.vue";

const paramsColumns = [
  {
    title: "名称",
    dataIndex: "name",
    width: 240,
  },
  {
    title: "类型",
    dataIndex: "type",
    align: "center",
    width: 130,
    customRender: (e: any) => {
      const { text, record } = e;
      if (text == "array" && record.childrenType) {
        return `${text}<${record.childrenType}>`;
      } else {
        return text;
      }
    },
  },
  {
    title: "必填",
    dataIndex: "require",
    width: 60,
    align: "center",
    slots: {
      customRender: "requireCell",
    },
  },
  {
    title: "默认值",
    dataIndex: "default",
    align: "center",
    width: 100,
  },
  {
    title: "说明",
    dataIndex: "desc",
    slots: {
      customRender: "rowDesc",
    },
  },
];

const returnColumns = [
  {
    title: "名称",
    dataIndex: "name",
    width: 240,
  },
  {
    title: "类型",
    dataIndex: "type",
    align: "center",
    width: 130,
    customRender: (e: any) => {
      const { text, record } = e;
      if (text == "array" && record.childrenType) {
        return `${text}<${record.childrenType}>`;
      } else {
        return text;
      }
    },
  },
  {
    title: "默认值",
    dataIndex: "default",
    align: "center",
    width: 100,
  },
  {
    title: "说明",
    dataIndex: "desc",
  },
];

export default defineComponent({
  components: {
    Table,
    CheckOutlined,
    MarkdownModal,
    Markdown,
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
  setup() {
    const markdownModalRef = ref<HTMLElement | null>(null);
    const state = reactive({
      paramsColumns: paramsColumns,
      returnColumns: returnColumns,
      tableScroll: {
        x: "700px",
        y: "100%",
      },
    });

    let paramsRowKey = 0;
    const renterRowKey = (record: ApiParamState) => {
      paramsRowKey++;
      return `${record.name}_${paramsRowKey}`;
    };

    function onShowMdDetail(record: ParamItem) {
      unref(markdownModalRef) &&
        (unref(markdownModalRef) as any).show(record.md, `${record.name}字段的说明`, record.mdRef);
    }

    return { ...toRefs(state), textToHtml, renterRowKey, onShowMdDetail, markdownModalRef };
  },
});
</script>
