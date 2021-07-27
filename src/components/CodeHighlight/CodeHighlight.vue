<template>
  <div class="code-highlight-wraper">
    <div :class="['code-highlight-box', theme]">
      <pre v-if="lang == 'json'" v-highlight:json="code"><code ></code></pre>
    </div>
    <div class="code-highlight-actins">
      <a-button class="full-button" size="small" @click="openModalView">
        <span><FullscreenOutlined /></span>
      </a-button>
      <a-button class="copy-button" size="small" @click="onCopy">
        <span v-if="isCopySuccess"><CheckOutlined /></span>
        <span v-else><CopyOutlined /></span>
      </a-button>
    </div>
  </div>
  <a-modal
    v-model:visible="visible"
    centered
    :title="title"
    width="80%"
    :footer="false"
    :bodyStyle="{ padding: '10px' }"
  >
    <div class="code-highlight-box" style="max-height: calc(100vh - 150px)">
      <pre v-if="lang == 'json'" v-highlight:json="code"><code ></code></pre>
    </div>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from "vue";
import { Button, Modal } from "ant-design-vue";
import { CopyOutlined, CheckOutlined, FullscreenOutlined } from "@ant-design/icons-vue";
import { copyTextToClipboard } from "@/utils";
import { useStore } from "vuex";
import { GlobalState } from "@/store";

export default defineComponent({
  components: {
    [Button.name]: Button,
    [Modal.name]: Modal,
    CopyOutlined,
    CheckOutlined,
    FullscreenOutlined,
  },
  props: {
    lang: {
      type: String as PropType<string>,
      default: "json",
    },
    code: {
      type: String as PropType<string>,
      default: "",
    },
    title: {
      type: String as PropType<string>,
      default: "",
    },
  },
  setup(props, { attrs }) {
    const store = useStore<GlobalState>();

    const isCopySuccess = ref(false);
    const visible = ref(false);
    const theme = computed(() => store.state.app.theme);

    function onCopy() {
      props.code && copyTextToClipboard(props.code);
      isCopySuccess.value = true;
      setTimeout(() => {
        isCopySuccess.value = false;
      }, 1000);
    }

    function openModalView() {
      visible.value = true;
    }
    return { onCopy, visible, isCopySuccess, openModalView, theme };
  },
});
</script>

<style lang="less" scoped>
.code-highlight-wraper {
  position: relative;

  .code-highlight-actins {
    position: absolute;
    top: 5px;
    right: 10px;
    display: none;
  }
  &:hover {
    .code-highlight-actins {
      display: block;
    }
  }
}
// .code-highlight-box {
//   max-height: 400px;
//   overflow: auto;
//   border: 1px solid #ddd;
//   pre {
//     margin-bottom: 0;
//   }

//   .hljs {
//     display: block;
//     overflow-x: auto;
//     padding: 0.5em;
//     background: var(--code-bgcolor);
//     color: black;
//   }

//   .hljs-comment,
//   .hljs-quote,
//   .hljs-variable {
//     color: #008000;
//   }

//   .hljs-keyword,
//   .hljs-selector-tag,
//   .hljs-built_in,
//   .hljs-name,
//   .hljs-tag {
//     color: #00f;
//   }

//   .hljs-string,
//   .hljs-title,
//   .hljs-section,
//   .hljs-attribute,
//   .hljs-literal,
//   .hljs-template-tag,
//   .hljs-template-variable,
//   .hljs-type,
//   .hljs-addition {
//     color: #a31515;
//   }

//   .hljs-deletion,
//   .hljs-selector-attr,
//   .hljs-selector-pseudo,
//   .hljs-meta {
//     color: #2b91af;
//   }

//   .hljs-doctag {
//     color: #808080;
//   }

//   .hljs-attr {
//     color: #f00;
//   }

//   .hljs-symbol,
//   .hljs-bullet,
//   .hljs-link {
//     color: #00b0e8;
//   }

//   .hljs-emphasis {
//     font-style: italic;
//   }

//   .hljs-strong {
//     font-weight: bold;
//   }
// }
</style>
