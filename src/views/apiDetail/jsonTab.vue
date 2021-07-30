<template>
  <div class="doc-content">
    <h2>{{ t("apiPage.title.header") }}</h2>
    <div class="api-param-code mb">
      <code-highlight :code="headerCode" :title="t('apiPage.title.header')" />
    </div>
    <h2>{{ t("apiPage.title.params") }}</h2>
    <div class="api-param-code mb">
      <code-highlight :code="paramCode" :title="t('apiPage.title.params')" />
    </div>

    <h2> {{ t("apiPage.title.responses") }} </h2>
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

export default defineComponent({
  components: {
    CodeHighlight,
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
      state.paramCode = formatJsonCode(renderCodeJsonByParams(props.detail.param));
      state.returnCode = formatJsonCode(renderCodeJsonByParams(props.detail.return));
      state.headerCode = formatJsonCode(renderCodeJsonByParams(props.detail.header));
    });

    return { ...toRefs(state), t };
  },
});
</script>
