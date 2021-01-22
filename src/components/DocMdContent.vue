<template>
  <div class="doc-content markdown" v-html="mdHtml"></div>
</template>

<script>
import marked from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

import "./markdown.less";
console.log(hljs);
marked.setOptions({
  highlight: function(code) {
    return hljs.highlightAuto(code).value;
  }
});

export default {
  props: {
    docData: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    mdHtml() {
      return marked(this.docData.content);
    }
  }
};
</script>
