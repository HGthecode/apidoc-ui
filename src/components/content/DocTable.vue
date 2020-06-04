<template>
  <div class="doc-content">
    <div v-if="apiData.header && apiData.header.length">
      <h2>请求头Headers</h2>
      <div class="api-param-table">
        <Table
          :columns="headersColumns"
          size="small"
          rowKey="name"
          :bordered="true"
          :pagination="false"
          :data-source="apiData.header"
        >
        </Table>
      </div>
    </div>
    <div v-if="apiData.param && apiData.param.length">
      <h2>请求参数Parameters</h2>
      <div class="api-param-table">
        <Table
          :columns="paramsColumns"
          size="small"
          :rowKey="renterRowKey"
          :bordered="true"
          :pagination="false"
          :data-source="apiData.param"
          childrenColumnName="params"
        >
        </Table>
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
      <Table
        :columns="returnColumns"
        size="small"
        :rowKey="renterRowKey"
        :bordered="true"
        :pagination="false"
        :data-source="apiData.return"
        childrenColumnName="params"
      >
      </Table>
    </div>
  </div>
</template>

<script>
import { Table, Icon, Popover } from "ant-design-vue";

let paramsRowKey = 0;
export default {
  components: {
    Table,
    Icon,
    Popover
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
  computed: {},
  data() {
    return {
      headersColumns: [
        {
          title: "名称",
          dataIndex: "name"
        },
        {
          title: "必填",
          dataIndex: "require",
          align: "center",
          customRender: text => {
            if (text == 1) {
              return <Icon type="check" style="color:#1890ff" />;
            } else {
              return "";
            }
          }
        },
        {
          title: "默认值",
          align: "center",
          dataIndex: "default"
        },
        {
          title: "说明",
          dataIndex: "desc"
        }
      ],
      paramsColumns: [
        {
          title: "名称",
          dataIndex: "name",
          width: 200
        },
        {
          title: "类型",
          dataIndex: "type",
          align: "center",
          width: 150
        },
        {
          title: "是否必填",
          dataIndex: "require",
          width: 100,
          align: "center",
          customRender: text => {
            if (text == 1) {
              return <Icon type="check" style="color:#1890ff" />;
            } else {
              return "";
            }
          }
        },
        {
          title: "默认值",
          dataIndex: "default",
          align: "center",
          width: 100
        },
        {
          title: "说明",
          dataIndex: "desc"
        }
      ],
      returnColumns: [
        {
          title: "名称",
          dataIndex: "name",
          width: 200
        },
        {
          title: "类型",
          dataIndex: "type",
          align: "center",
          width: 150
        },
        {
          title: "默认值",
          dataIndex: "default",
          align: "center",
          width: 100
        },
        {
          title: "说明",
          dataIndex: "desc"
        }
      ]
    };
  },

  created() {},
  methods: {
    // 处理table行rowKey防止key重复
    renterRowKey(record) {
      paramsRowKey++;
      return `${record.name}_${paramsRowKey}`;
    }
  }
};
</script>

<style lang="less" scoped>
.api-param-table {
  margin-bottom: 16px;
}
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
