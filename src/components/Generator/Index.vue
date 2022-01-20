<template>
  <a-dropdown v-if="config && config.generator && config.generator.length">
    <template #overlay>
      <a-menu @click="handleMenuClick">
        <a-menu-item v-for="(item, index) in config.generator" :key="index">{{
          item.title
        }}</a-menu-item>
      </a-menu>
    </template>
    <a-button>
      {{ t("generator.title") }}
      <DownOutlined />
    </a-button>
  </a-dropdown>

  <a-modal
    :visible="visible"
    width="90%"
    :bodyStyle="{ padding: '0 10px 10px' }"
    :maskClosable="false"
    :title="modalTitle"
    centered
    destroyOnClose
    class="generator-modal"
    @cancel="onCancelModal"
  >
    <div class="generator-wraper">
      <data-form
        ref="formRef"
        :colspan="
          currentGenerator.form && currentGenerator.form.colspan ? currentGenerator.form.colspan : 3
        "
        :items="formItems"
        :data="formData"
        style="margin-bottom: 10px"
      />
      <files-editor ref="filesRef" :files="currentGenerator.files" :appKey="currentAppKey" />
      <data-table-editor
        v-for="(item, index) in tableItems"
        :key="index"
        :ref="setTableRef"
        :data="item.default_fields"
        :option="item"
        :fieldTypes="currentGenerator.table.field_types"
      />
    </div>
    <template #footer>
      <a-button danger ghost @click="onCancelModal">{{ t("common.cancel") }}</a-button>
      <a-button type="primary" @click="handleOk">{{ t("common.ok") }}</a-button>
    </template>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent, computed, ref, reactive, toRefs } from "vue";
import { DownOutlined } from "@ant-design/icons-vue";
import {
  Button,
  Modal,
  Alert,
  message,
  Select,
  Space,
  Form,
  Input,
  Dropdown,
  Menu,
  Checkbox,
  notification,
} from "ant-design-vue";
import useModal from "@/hooks/useModal";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import { useI18n } from "@/hooks/useI18n";
// import AppSelect from "../AppSelect";
import { getAppsConfigItemByKey } from "@/utils/index";
import {
  ConfigAppGroupItem,
  ConfigAppItem,
  ConfigGeneratorItem,
  ConfigGeneratorItemTableItem,
} from "@/api/interface/config";
import { MenuInfo } from "ant-design-vue/lib/menu/src/interface";
import { confirmEndingString } from "@/utils";
import DataForm from "../DataForm";
import { FormItemType } from "../DataForm/interface";
import DataTableEditor from "../DataTableEditor";
import { generator } from "@/api";
import FilesEditor from "./FilesEditor.vue";

interface SelectOptionType {
  label: string;
  value: string | number;
}

export default defineComponent({
  components: {
    DownOutlined,
    [Button.name]: Button,
    [Modal.name]: Modal,
    [Alert.name]: Alert,
    [Select.name]: Select,
    [Space.name]: Space,
    [Form.name]: Form,
    [Form.Item.name]: Form.Item,
    [Input.name]: Input,
    // AppSelect,
    [Dropdown.name]: Dropdown,
    [Menu.name]: Menu,
    [Menu.Item.name]: Menu.Item,
    [Checkbox.name]: Checkbox,
    DataForm,
    DataTableEditor,
    FilesEditor,
  },
  emits: ["submitSuccess"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const store = useStore<GlobalState>();
    const { visible, onShow, onCancel } = useModal();
    const formRef = ref();
    const filesRef = ref();
    let tableRefs: any = [];
    const setTableRef = (el: any) => {
      if (el) {
        tableRefs.push(el);
      }
    };

    const groupOptions: SelectOptionType[] = [
      {
        label: "",
        value: "",
      },
    ];
    const currentIndex: any = "";
    const formData: any = {};
    const currentGenerator: ConfigGeneratorItem = {
      title: "",
      name: "",
      files: [],
    };
    const formItems: FormItemType[] = [];
    const tableItems: ConfigGeneratorItemTableItem[] = [];
    const state = reactive({
      config: computed(() => store.state.app.config),
      isMobile: computed(() => store.state.app.isMobile),
      appKey: computed(() => store.state.app.appKey),
      groupOptions: groupOptions,
      currentIndex: currentIndex,
      currentGenerator: currentGenerator,
      currentAppKey: "",
      modalTitle: t("generator.title"),
      formData: formData,
      formItems: formItems,
      tableItems: tableItems,
    });

    async function handleOk() {
      const formValues = await formRef.value.onSubmit();

      const fileDatas = filesRef.value.getData();
      if (!fileDatas) {
        return;
      }

      let tables = [];
      if (tableRefs && tableRefs.length) {
        let isError = false;
        for (let i = 0; i < tableRefs.length; i++) {
          const tableItem: any = tableRefs[i];
          if (tableItem && tableItem.getData) {
            const tableData = tableItem.getData();
            if (tableData) {
              tables.push(tableData);
            } else {
              isError = true;
              break;
            }
          }
        }
        if (isError) {
          return;
        }
      }

      const json = {
        index: state.currentIndex,
        form: formValues,
        files: fileDatas,
        tables: tables,
      };

      generator(json)
        .then(() => {
          message.success(t("generator.submitSuccess"));
          onCancelModal();
          emit("submitSuccess");
        })
        .catch((err) => {
          if (err.response) {
            const message =
              err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : err.message;
            notification.error({
              message: err.response.status,
              description: message,
            });
          } else {
            notification.error({
              message: err.response.status,
              description: err.message,
            });
          }
        });
    }

    /**
     * 监听表单的App选择
     */
    function onAppChange(appKey: string) {
      state.currentAppKey = appKey;
      tableRefs = [];
      const appConfig = getAppsConfigItemByKey(state.config.apps as ConfigAppItem[], appKey);
      if (appConfig as ConfigAppItem) {
        const groups = appConfig?.groups as ConfigAppGroupItem[];
        const findIndex = state.formItems.findIndex((p) => p.type === "group-select");
        if (findIndex > -1) {
          if (formRef.value) {
            const currentFormData = formRef.value.getData();
            state.formData = {
              ...currentFormData,
              [state.formItems[findIndex].field]: "",
            };
          }
          let groupOptions: any[] = [];
          if (groups && groups.length) {
            groupOptions = groups;
          }
          state.formItems[findIndex].props = {
            ...state.formItems[findIndex].props,
            treeData: groupOptions,
          };
        }
      }
    }

    function handleMenuClick(e: MenuInfo) {
      state.currentIndex = e.key;
      tableRefs = [];
      const generatorFind = state.config.generator && state.config.generator[e.key as number];
      if (generatorFind) {
        state.modalTitle = `${t("generator.title")} - ${generatorFind.title}`;
        state.currentGenerator = generatorFind;
        if (generatorFind.form && generatorFind.form.items) {
          const items: FormItemType[] = [
            {
              title: t("generator.apps.title"),
              field: "appKey",
              type: "app-select",
            },
            {
              title: t("generator.group.title"),
              field: "group",
              type: "group-select",
            },
            ...generatorFind.form.items,
          ];
          state.formItems = items.map((item) => {
            if (item.type === "app-select") {
              item.onChange = (appKey: string) => {
                onAppChange(appKey);
              };
            }
            return item;
          });
          state.formData = {
            appKey: state.appKey,
            group: "",
          };
        }
        if (generatorFind.table && generatorFind.table.items) {
          state.tableItems = generatorFind.table.items;
        } else {
          state.tableItems = [];
        }

        onShow();
        onAppChange(state.appKey);
      }
    }

    function onCancelModal() {
      state.currentIndex = "";
      state.formData = {};
      state.tableItems = [];
      state.currentGenerator = currentGenerator;
      onCancel();
    }

    return {
      formRef,
      filesRef,
      ...toRefs(state),
      visible,
      onShow,
      onCancelModal,
      handleOk,
      t,
      onAppChange,
      handleMenuClick,
      confirmEndingString,
      setTableRef,
    };
  },
});
</script>
<style lang="less" scoped>
@import "./generator.less";
</style>
