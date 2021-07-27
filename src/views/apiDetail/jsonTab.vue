<template>
  <div class="doc-content">
    <h2>请求头Headers</h2>
    <div class="api-param-code mb">
      <code-highlight :code="headerCode" title="请求头Headers" />
    </div>
    <h2>请求参数Parameters</h2>
    <div class="api-param-code mb">
      <code-highlight :code="paramCode" title="请求参数Parameters" />
    </div>

    <h2> 响应结果Responses </h2>
    <div class="api-param-code mb">
      <code-highlight :code="returnCode" title="响应结果Responses" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, toRefs, watchEffect } from "vue";
import { ApiDetailState } from "./interface";
import { renderCodeJsonByParams, formatJsonCode } from "@/utils/helper/codeHelper";
import CodeHighlight from "@/components/CodeHighlight";

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

    return { ...toRefs(state) };
  },
});
</script>
