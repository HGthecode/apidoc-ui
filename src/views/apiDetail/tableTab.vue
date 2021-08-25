<template>
  <div class="api-table">
    <div class="desc">
      <div v-if="detail.desc" v-html="textToHtml(detail.desc)"> </div>
      <markdown v-if="detail.md" :md="detail.md" />
    </div>
    <div v-if="detail.header && detail.header.length">
      <h2>{{ t("apiPage.title.header") }}</h2>
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
      <h2>{{ t("apiPage.title.params") }}</h2>
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
              <a v-if="record.md || record.mdRef" @click="onShowMdDetail(record)">{{
                t("common.view")
              }}</a>
            </div>
          </template>
        </Table>
      </div>
    </div>

    <div v-if="detail.return && detail.return.length">
      <h2> {{ t("apiPage.title.responses") }} </h2>
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
import { ApiDetailState } from "./interface";
import { Table } from "ant-design-vue";
import { CheckOutlined } from "@ant-design/icons-vue";
import { textToHtml } from "@/utils";
import MarkdownModal from "@/components/Markdown/Modal.vue";
import { ParamItem } from "@/api/interface/apiData";
import Markdown from "@/components/Markdown/Markdown.vue";
import { useI18n } from "@/hooks/useI18n";

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
    const { t } = useI18n();
    const markdownModalRef = ref<HTMLElement | null>(null);

    const paramsColumns = [
      {
        title: t("common.field"),
        dataIndex: "name",
        width: 240,
      },
      {
        title: t("common.type"),
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
        title: t("common.require"),
        dataIndex: "require",
        width: 100,
        align: "center",
        slots: {
          customRender: "requireCell",
        },
      },
      {
        title: t("common.defaultValue"),
        dataIndex: "default",
        align: "center",
        width: 100,
      },
      {
        title: t("common.desc"),
        dataIndex: "desc",
        slots: {
          customRender: "rowDesc",
        },
      },
    ];

    const returnColumns = paramsColumns.filter((p) => p.dataIndex !== "require");

    const state = reactive({
      paramsColumns: paramsColumns,
      returnColumns: returnColumns,
      tableScroll: {
        x: "700px",
        y: "100%",
      },
    });

    let paramsRowKey = 0;
    const renterRowKey = (record: ParamItem) => {
      paramsRowKey++;
      return `${record.name}_${paramsRowKey}`;
    };

    function onShowMdDetail(record: ParamItem) {
      unref(markdownModalRef) &&
        (unref(markdownModalRef) as any).show(
          record.md,
          t("apiPage.mdDetail.title", { name: record.name }),
          record.mdRef
        );
    }

    return { ...toRefs(state), textToHtml, renterRowKey, onShowMdDetail, markdownModalRef, t };
  },
});
</script>

<style lang="less" scoped>
.api-table {
  .desc {
    margin-bottom: 16px;
    color: var(--text-color);
  }
}
</style>
