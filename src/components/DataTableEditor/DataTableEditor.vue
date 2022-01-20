<template>
  <div class="data-table-editor">
    <div class="table-title">
      <b>{{ option.title }}</b>
      <span>{{ t("generator.model.name") }}：</span>
      <span>{{ option.path }}\</span>
      <Input v-model:value="modelName" style="width: 160px" @change="onModelNameChange" />
      ，
      <span>{{ t("generator.table.name") }}：</span>
      <Input v-model:value="tableName" style="width: 160px" />
      ，
      <span>{{ t("generator.table.comment") }}：</span>
      <Input v-model:value="tableComment" style="width: 160px" />
    </div>
    <div v-if="currentAlert && currentAlert.message" class="table-desc"
      ><Alert banner :type="currentAlert.type" :message="currentAlert.message"></Alert
    ></div>
    <Table
      :columns="columns"
      size="small"
      rowKey="id"
      :bordered="true"
      :pagination="false"
      :data-source="currentData"
      :scroll="tableScroll"
    >
      <template #inputEditCell="{ text, column, record }">
        <TableInput
          :data="text"
          v-bind="column.props"
          @change="onInputCellChange(column, record, $event)"
        />
      </template>
      <template #numberEditCell="{ text, column, record }">
        <InputNumber
          :value="text"
          v-bind="column.props"
          @change="onNumberCellChange(column, record, $event)"
        />
      </template>
      <template #checkboxEditCell="{ text, column, record }">
        <Checkbox
          :checked="text"
          v-bind="column.props"
          @change="onCheckboxCellChange(column, record, $event, text)"
        />
      </template>
      <template #typeEditCell="{ text, column, record }">
        <Select
          :options="fieldTypes"
          :value="text"
          showSearch
          style="width: 100%; text-align: left"
          @change="onSelectCellChange(column, record, $event, text)"
        >
        </Select>
      </template>
      <template #selectEditCell="{ text, column, record }">
        <Select
          :value="text"
          showSearch
          allowClear
          v-bind="column.props"
          style="width: 100%; text-align: left"
          @change="onSelectCellChange(column, record, $event, text)"
        >
        </Select>
      </template>

      <template #actionRow="{ record }">
        <a-button type="link" danger @click="deleteRow(record)"><DeleteOutlined /></a-button>
      </template>
    </Table>

    <a-button style="margin-top: 10px" @click="addRow">+ {{ t("globalParam.add") }}</a-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, toRefs, watch, computed } from "vue";
import { Button, Table, InputNumber, Checkbox, Input, Select, Alert } from "ant-design-vue";
import TableInput from "@/components/TableInput";
import { DataItemType } from "./interface";
import { DeleteOutlined } from "@ant-design/icons-vue";
import { createRandKey, camelToUnderline, trim, checkRules } from "@/utils";
import { useI18n } from "@/hooks/useI18n";
import { ConfigAppItem, ConfigGeneratorItemTableItem } from "@/api/interface/config";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import { cloneDeep, isArray } from "lodash";
import { InputRuleItem } from "@/utils/interface";

interface ObjectType {
  [key: string]: any;
}

export default defineComponent({
  components: {
    [Button.name]: Button,
    Table,
    TableInput,
    DeleteOutlined,
    InputNumber,
    Checkbox,
    Input,
    Select,
    Alert,
  },
  props: {
    data: {
      type: Array as PropType<DataItemType[]>,
      default: () => [],
    },
    option: {
      type: Object as PropType<ConfigGeneratorItemTableItem>,
    },
    fieldTypes: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  setup(props) {
    const { t } = useI18n();
    let store = useStore<GlobalState>();

    let columns: any = [
      {
        title: t("generator.table.field"),
        dataIndex: "field",
        width: 150,
        align: "center",
        slots: {
          customRender: "inputEditCell",
        },
      },
      {
        title: t("generator.table.desc"),
        dataIndex: "desc",
        width: 150,
        align: "center",
        slots: {
          customRender: "inputEditCell",
        },
      },
      {
        title: t("generator.table.type"),
        dataIndex: "type",
        width: 120,
        align: "center",
        slots: {
          customRender: "typeEditCell",
        },
      },
      {
        title: t("generator.table.length"),
        dataIndex: "length",
        width: 100,
        align: "center",
        slots: {
          customRender: "inputEditCell",
        },
      },
      {
        title: t("generator.table.default"),
        dataIndex: "default",
        width: 150,
        align: "center",
        slots: {
          customRender: "inputEditCell",
        },
      },
      {
        title: t("generator.table.notNull"),
        dataIndex: "not_null",
        width: 65,
        align: "center",
        slots: {
          customRender: "checkboxEditCell",
        },
      },
      {
        title: t("generator.table.mainKey"),
        dataIndex: "main_key",
        width: 60,
        align: "center",
        slots: {
          customRender: "checkboxEditCell",
        },
      },
      {
        title: t("generator.table.autoAdd"),
        dataIndex: "incremental",
        width: 50,
        align: "center",
        slots: {
          customRender: "checkboxEditCell",
        },
      },
    ];

    if (props.option && props.option.columns) {
      for (let i = 0; i < props.option.columns.length; i++) {
        const column = cloneDeep(props.option.columns[i]);
        let customRender = "inputEditCell";
        if (column.type === "checkbox") {
          customRender = "checkboxEditCell";
        } else if (column.type === "number") {
          customRender = "numberEditCell";
        } else if (column.type === "select") {
          customRender = "selectEditCell";
        }
        columns.push({
          width: 80,
          align: "center",
          dataIndex: column.field,
          ...column,
          slots: {
            customRender: customRender,
          },
        });
      }
    }

    const state = reactive({
      config: computed(() => store.state.app.config),
      option: props.option,
      fieldTypes: props.fieldTypes.map((p) => {
        return {
          label: p,
          value: p,
        };
      }),
      tableName: "",
      tableComment: "",
      modelName: "",
      currentAlert: {
        type: "warning",
        message: "",
      },
      columns: [
        ...columns,
        {
          title: t("common.action"),
          dataIndex: "id",
          width: 70,
          align: "center",
          slots: {
            customRender: "actionRow",
          },
        },
      ],
      currentData: cloneDeep(props.data).map((p) => {
        return {
          ...p,
          id: createRandKey(),
        };
      }),
      tableScroll: {
        x: "700px",
        y: "360px",
      },
      appSelectData: computed(() => {
        const config = store.state.app.config;
        const apps = cloneDeep(config.apps as ConfigAppItem[]);
        return [
          {
            folder: "global",
            title: t("globalParam.title"),
          },
          ...apps,
        ];
      }),
    });

    if (props.option?.desc) {
      state.currentAlert.message = props.option.desc as string;
    }

    function onAppChange(row: any, e: any, key: string) {
      row[key] = e;
    }

    function onInputCellChange(column: any, record: any, e: any) {
      const { value } = e.target;
      record[column.dataIndex] = value;
    }
    function onNumberCellChange(column: any, record: any, v: any) {
      record[column.dataIndex] = v;
    }
    function onCheckboxCellChange(column: any, record: any, e: any, text: any) {
      const { checked } = e.target;
      record[column.dataIndex] = checked;
    }
    function onSelectCellChange(column: any, record: any, v: any) {
      record[column.dataIndex] = v;
    }
    function deleteRow(record: any) {
      state.currentData = state.currentData.filter((p) => p.id !== record.id);
    }

    function addRow() {
      let defaultValues = {};
      if (props.option && props.option.default_values) {
        defaultValues = props.option.default_values;
      }
      state.currentData.push({
        id: createRandKey(),
        field: "",
        type: "",
        desc: "",
        ...defaultValues,
      });
    }

    function getData() {
      // const { tableName, modelName } = state;
      const tableName = trim(state.tableName);
      const modelName = trim(state.modelName);

      //验证模型名规则
      let model_rules: InputRuleItem[] = [
        { required: true, message: t("generator.model.name.placeholder") },
      ];
      if (props.option?.model_rules) {
        model_rules = [...model_rules, ...props.option.model_rules];
      }
      const modelNameCheckMessage = checkRules(modelName, model_rules);
      if (modelNameCheckMessage) {
        state.currentAlert = {
          type: "error",
          message: modelNameCheckMessage,
        };
        return;
      }
      // 验证表名规则
      let table_rules: InputRuleItem[] = [
        { required: true, message: t("generator.table.name.placeholder") },
      ];
      if (props.option?.table_rules) {
        table_rules = [...table_rules, ...props.option.table_rules];
      }
      const tableNameCheckMessage = checkRules(tableName, table_rules);
      if (tableNameCheckMessage) {
        state.currentAlert = {
          type: "error",
          message: tableNameCheckMessage,
        };
        return;
      }

      // 处理返回值
      let tableErrorRows: number[] = [];
      const columnsObj: ObjectType = {};
      // 是否需要处理每行数据，如果不存在需要处理的条件则不执行循环，以提供性能
      let isHandleItemData = false;
      for (let i = 0; i < state.columns.length; i++) {
        const column = state.columns[i];
        columnsObj[column.dataIndex] = column;
        // 目前只对自定义的select输入项处理
        if (column.type === "select" && column.props && column.props.options) {
          isHandleItemData = true;
        }
      }
      const currentData: DataItemType[] = cloneDeep(state.currentData);
      const datas = currentData.map((item, index: number) => {
        // 存在需要处理的列，才执行
        if (isHandleItemData) {
          for (const key in item) {
            const val = item[key];
            const column = columnsObj[key];
            // 下拉框返回所选的参数对象
            if (column && column.type === "select" && column.props && column.props.options) {
              let values: string | ObjectType[] = "";
              if (
                column.props &&
                column.props.mode &&
                column.props.mode == "multiple" &&
                isArray(val)
              ) {
                values = column.props.options.filter((p: any) => val.includes(p.value));
              } else {
                values = column.props.options.find((p: any) => p.value == val);
              }
              item[key] = values;
            }
          }
        }
        // 验证必填
        if (!(item.field && item.type)) {
          tableErrorRows.push(index + 1);
        }
        return item;
      });

      if (tableErrorRows.length) {
        state.currentAlert = {
          type: "error",
          message: t("generator.table.row.error", { rows: tableErrorRows.join(",") }),
        };
        return;
      }

      //还原提示内容
      state.currentAlert = {
        type: "warning",
        message: props.option ? (props.option.desc as string) : "",
      };

      return {
        table_name: tableName,
        model_name: modelName,
        table_comment: state.tableComment,
        namespace: state.option && state.option.namespace ? state.option.namespace : "",
        model_path: state.option && state.option.path ? state.option.path : "",
        template: state.option && state.option.template ? state.option.template : "",
        datas: datas,
      };
    }

    function onModelNameChange(e: any) {
      const { value } = e.target;
      if (value) {
        state.tableName = camelToUnderline(value);
      }
    }

    watch(
      () => props.data,
      () => {
        state.currentData = props.data;
      }
    );

    return {
      ...toRefs(state),
      onInputCellChange,
      onNumberCellChange,
      onCheckboxCellChange,
      onSelectCellChange,
      onAppChange,
      deleteRow,
      addRow,
      getData,
      t,
      onModelNameChange,
    };
  },
});
</script>

<style lang="less">
@import "./dataTableEditor.less";
</style>
