<template>
  <div style="height: 342px">
    <Table
      :columns="columns"
      size="small"
      rowKey="id"
      :bordered="true"
      :pagination="false"
      :data-source="currentData"
      :scroll="tableScroll"
    >
      <template #editRowAppKey="{ text, record }">
        <app-select
          :showLock="false"
          :value="text"
          :options="appSelectData"
          :disabled="record.appDisabled"
          @change="onAppChange(record, $event, 'appKey')"
        />
      </template>
      <template #editRowKey="{ text, record }">
        <TableInput :data="text" @change="onCellChange(record, $event, 'name')" />
      </template>
      <template #editRowValue="{ text, record }">
        <TableInput :data="text" @change="onCellChange(record, $event, 'value')" />
      </template>
      <template #editRowDesc="{ text, record }">
        <TableInput :data="text" @change="onCellChange(record, $event, 'desc')" />
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
import { Button, Table } from "ant-design-vue";
import TableInput from "@/components/TableInput";
import { DataItemType } from "./interface";
import { DeleteOutlined } from "@ant-design/icons-vue";
import { createRandKey } from "@/utils";
import { useI18n } from "@/hooks/useI18n";
import AppSelect from "../AppSelect";
import { ConfigAppItem } from "@/api/interface/config";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import { cloneDeep } from "lodash";

export default defineComponent({
  components: {
    [Button.name]: Button,
    Table,
    TableInput,
    DeleteOutlined,
    AppSelect,
  },
  props: {
    data: {
      type: Array as PropType<DataItemType[]>,
      default: () => [],
    },
  },
  setup(props) {
    const { t } = useI18n();
    let store = useStore<GlobalState>();

    const state = reactive({
      config: computed(() => store.state.app.config),
      columns: [
        {
          title: t("common.appOrVersion"),
          dataIndex: "appKey",
          width: 158,
          slots: {
            customRender: "editRowAppKey",
          },
        },
        {
          title: t("common.field"),
          dataIndex: "name",
          width: 150,
          slots: {
            customRender: "editRowKey",
          },
        },
        {
          title: t("common.value"),
          dataIndex: "value",
          slots: {
            customRender: "editRowValue",
          },
        },
        {
          title: t("common.desc"),
          dataIndex: "desc",
          width: 260,
          slots: {
            customRender: "editRowDesc",
          },
        },
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
      currentData: props.data,
      tableScroll: {
        x: "700px",
        y: "260px",
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

    function onAppChange(row: any, e: any, key: string) {
      row[key] = e;
    }

    function onCellChange(row: any, e: any, key: string) {
      const { value } = e.target;
      row[key] = value;
    }

    function deleteRow(record: any) {
      state.currentData = state.currentData.filter((p) => p.id !== record.id);
    }

    function addRow() {
      state.currentData.push({
        id: createRandKey(),
        name: "",
        value: "",
        desc: "",
        appKey: "global",
      });
    }

    function getData() {
      return state.currentData;
    }

    watch(
      () => props.data,
      () => {
        state.currentData = props.data;
      }
    );

    return {
      ...toRefs(state),
      onCellChange,
      onAppChange,
      deleteRow,
      addRow,
      getData,
      t,
    };
  },
});
</script>

<style lang="less">
// @import "./index.less";
</style>
