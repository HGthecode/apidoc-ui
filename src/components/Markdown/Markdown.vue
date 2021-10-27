<template>
  <div class="markdown" v-html="mdHtml"></div>
</template>

<script lang="ts">
import { defineComponent, PropType, watchEffect, ref } from "vue";

import marked from "marked";
import * as hljs from "highlight.js/lib/core.js";
import * as json from "highlight.js/lib/languages/json";
import * as php from "highlight.js/lib/languages/php";
import * as javascript from "highlight.js/lib/languages/javascript";
import * as xml from "highlight.js/lib/languages/xml";

hljs.registerLanguage("json", json);
hljs.registerLanguage("php", php);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("xml", xml);

marked.setOptions({
  highlight: function (code: string) {
    return hljs.highlightAuto(code).value;
  },
});
export default defineComponent({
  props: {
    md: {
      type: String as PropType<string>,
      default: "",
    },
  },
  setup(props) {
    const mdHtml = ref("");

    watchEffect(() => {
      mdHtml.value = marked(props.md);
    });

    return { mdHtml };
  },
});
</script>
<style lang="less">
@import "./markdown.less";
</style>
