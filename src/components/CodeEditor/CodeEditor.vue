<template>
  <div :class="['code-edit-wraper', { mobile: isMobile }]">
    <div class="code-edit-box">
      <monaco-editor :code="code" :readOnly="readOnly" @change="onCodeChange" />
    </div>
    <div class="code-edit-actins">
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
    width="90%"
    :footer="false"
    :bodyStyle="{ padding: '10px' }"
  >
    <div class="code-edit-box">
      <monaco-editor
        :code="code"
        @change="onCodeChange"
        :readOnly="readOnly"
        height="calc(100vh - 150px)"
      />
    </div>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from "vue";
import { Button, Modal } from "ant-design-vue";
import { CopyOutlined, CheckOutlined, FullscreenOutlined } from "@ant-design/icons-vue";
import { copyTextToClipboard } from "@/utils";
import MonacoEditor from "@/components/MonacoEditor";
import * as Monaco from "monaco-editor";
import { useStore } from "vuex";
import { GlobalState } from "@/store";

export default defineComponent({
  components: {
    [Button.name]: Button,
    [Modal.name]: Modal,
    CopyOutlined,
    CheckOutlined,
    FullscreenOutlined,
    MonacoEditor,
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
    onChange: {
      type: Function as PropType<
        (value: string, event: Monaco.editor.IModelContentChangedEvent) => void
      >,
      required: true,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs }) {
    const store = useStore<GlobalState>();
    const isCopySuccess = ref(false);
    const visible = ref(false);
    const isMobile = computed(() => store.state.app.isMobile);

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

    function onCodeChange(code: string, event: Monaco.editor.IModelContentChangedEvent) {
      props.onChange(code, event);
    }
    return { onCopy, visible, isCopySuccess, openModalView, onCodeChange, isMobile };
  },
});
</script>

<style lang="less" scoped>
.code-edit-wraper {
  position: relative;

  .code-edit-actins {
    position: absolute;
    top: 5px;
    right: 15px;
    display: none;
  }
  &.mobile,
  &:hover {
    .code-edit-actins {
      display: block;
    }
  }
}
.code-edit-box {
  border: 1px solid var(--color-line);
  pre {
    margin-bottom: 0;
  }
  .hljs {
    background: var(--code-bgcolor);
  }
}
</style>
