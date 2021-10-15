<template>
  <div :class="['code-highlight-wraper', { mobile: isMobile }]">
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
    width="90%"
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
    return { onCopy, visible, isCopySuccess, openModalView, theme, isMobile };
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
  &.mobile,
  &:hover {
    .code-highlight-actins {
      display: block;
    }
  }
}
</style>
