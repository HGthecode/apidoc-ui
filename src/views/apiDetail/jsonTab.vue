<template>
  <div class="doc-content">
    <div v-if="headerCode">
      <Title :title="t('apiPage.title.header')" />
      <div class="api-param-code mb">
        <code-highlight :code="headerCode" :title="t('apiPage.title.header')" />
      </div>
    </div>
    <Title :title="t('apiPage.title.params')" />
    <div class="api-param-code mb">
      <code-highlight :code="paramCode" :title="t('apiPage.title.params')" />
    </div>

    <Title :title="t('apiPage.title.responses')" />
    <div class="api-param-code mb">
      <code-highlight :code="returnCode" :title="t('apiPage.title.responses')" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, toRefs, watchEffect } from "vue";
import { ApiDetailState } from "./interface";
import { renderCodeJsonByParams, formatJsonCode } from "@/utils/helper/codeHelper";
import CodeHighlight from "@/components/CodeHighlight";
import { useI18n } from "@/hooks/useI18n";
import Title from "./Title.vue";

export default defineComponent({
  components: {
    CodeHighlight,
    Title,
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
  setup(props) {
    const { t } = useI18n();
    const state = reactive({
      paramCode: "",
      returnCode: "",
      headerCode: "",
    });

    watchEffect(() => {
      if (props.detail.param) {
        state.paramCode = formatJsonCode(renderCodeJsonByParams(props.detail.param));
      }
      if (props.detail.return) {
        state.returnCode = formatJsonCode(renderCodeJsonByParams(props.detail.return));
      }
      if (props.detail.header) {
        state.headerCode = formatJsonCode(renderCodeJsonByParams(props.detail.header));
      }
    });

    return { ...toRefs(state), t };
  },
});
</script>
