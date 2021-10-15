<template>
  <span class="menu-item-content">
    <CopyrightCircleOutlined v-if="item.type == 'controller'" />
    <span
      v-else-if="item.method && item.method.indexOf(',') > -1"
      :class="['api-method-icon', `method-color_multiple`]"
    >
      <span class="method-icon_multiple">{{ item.method.split(",").length }} </span>
    </span>
    <span v-else-if="item.method" :class="['api-method-icon', `method-color_${item.method}`]">{{
      item.method
    }}</span>
    <FileMarkdownOutlined v-else-if="item.path && item.type === 'md'" />
    <FolderOutlined v-else />

    {{ title }}
  </span>
</template>
<script lang="ts">
import { defineComponent, computed } from "vue";
import { useI18n } from "@/hooks/useI18n";
import {
  CopyrightCircleOutlined,
  FolderOutlined,
  FileMarkdownOutlined,
} from "@ant-design/icons-vue";

export default defineComponent({
  components: {
    FolderOutlined,
    CopyrightCircleOutlined,
    FileMarkdownOutlined,
  },
  props: {
    item: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  setup(props) {
    const { t } = useI18n();
    const title = computed(() => {
      if (props.item.title === "未分组") {
        return t("common.notGroup");
      }
      return props.item.title;
    });
    return { title };
  },
});
</script>
<style lang="less" scoped>
.api-method-icon {
  display: inline-block;
  width: 36px;
  font-size: 12px;
}
.method-color_GET {
  color: var(--color-green);
}
.method-color_POST {
  color: var(--color-blue);
}
.method-color_PUT {
  color: var(--color-orange);
}
.method-color_DELETE {
  color: var(--color-red);
}
.method-icon_multiple {
  border: 1px solid var(--text-light-grey);
  padding: 0px 10px;
  border-radius: 2px;
}
</style>
