<template>
  <div class="doc-content">
    <h2>请求头Headers</h2>
    <div class="api-param-code mb">
      <div class="code">
        <!-- <pre v-highlight:json="headerCode"><code ></code></pre> -->
        <code-highlight :code="headerCode" />
      </div>
    </div>
    <h2>请求参数Parameters</h2>
    <div class="api-param-code mb">
      <div class="code">
        <!-- <pre v-highlight:json="paramCode"><code ></code></pre> -->
        <code-highlight :code="paramCode" />
      </div>
    </div>

    <h2> 响应结果Responses </h2>
    <div class="api-param-code mb">
      <div class="code">
        <!-- <monaco-editor :code="returnCode" /> -->
        <code-highlight :code="returnCode" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, toRefs, watchEffect } from "vue";
import { ApiDetailState } from "./interface";
import { renderCodeJsonByParams, formatJson } from "@/utils/helper/codeHelper";
import CodeHighlight from "@/components/CodeHighlight";
// import MonacoEditor from "@/components/MonacoEditor";

export default defineComponent({
  components: {
    // MonacoEditor,
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
      state.paramCode = formatJson(renderCodeJsonByParams(props.detail.param));
      state.returnCode = formatJson(renderCodeJsonByParams(props.detail.return));
      state.headerCode = formatJson(renderCodeJsonByParams(props.detail.header));
    });

    return { ...toRefs(state) };
  },
});
</script>
