<template>
  <div class="markdown" v-html="mdHtml"></div>
</template>

<script lang="ts">
  import { defineComponent, PropType, watchEffect, ref } from 'vue'

  import 'highlight.js/styles/github.css'
  import { marked } from 'marked'
  import hljs from 'highlight.js/lib/core'
  import javascript from 'highlight.js/lib/languages/javascript'
  import json from 'highlight.js/lib/languages/json'
  import php from 'highlight.js/lib/languages/php'

  hljs.registerLanguage('json', json)
  hljs.registerLanguage('php', php)
  hljs.registerLanguage('javascript', javascript)

  marked.setOptions({
    highlight: function (code: string) {
      return hljs.highlightAuto(code).value
    },
  })
  export default defineComponent({
    props: {
      md: {
        type: String as PropType<string>,
        default: '',
      },
    },
    setup(props) {
      const mdHtml = ref('')
      watchEffect(() => {
        mdHtml.value = marked(props.md)
      })

      return { mdHtml }
    },
  })
</script>
<style lang="less">
  @import './markdown.less';
</style>
