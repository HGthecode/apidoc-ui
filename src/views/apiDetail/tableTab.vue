<template>
  <div class="api-table">
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
        </Table>
      </div>
    </div>

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
</template>

<script lang="ts">
import { defineComponent, reactive, PropType, toRefs } from "vue";
import { ApiDetailState, ApiParamState } from "./interface";
import { Table } from "ant-design-vue";
import { CheckOutlined } from "@ant-design/icons-vue";

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
    width: 80,
  },
  {
    title: "说明",
    dataIndex: "desc",
    // slots: {
    //   customRender: "rowDesc",
    // },
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
    width: 80,
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
    const state = reactive({
      paramsColumns: paramsColumns,
      returnColumns: returnColumns,
      tableScroll: {
        x: "700px",
        y: "100%",
      },
    });

    const textToHtml = () => {
      console.log("textToHtml");
    };
    let paramsRowKey = 0;
    const renterRowKey = (record: ApiParamState) => {
      paramsRowKey++;
      return `${record.name}_${paramsRowKey}`;
    };

    return { ...toRefs(state), textToHtml, renterRowKey };
  },
});
</script>
