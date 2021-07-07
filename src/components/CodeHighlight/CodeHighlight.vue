<template>
  <div class="code-highlight-wraper">
    <pre v-if="lang == 'json'" v-highlight:json="code"><code ></code></pre>
    <a-button v-if="isCopySuccess" class="copy-button" size="small" @click="onCopy">
      <CheckOutlined />成功
    </a-button>
    <a-button v-else class="copy-button" size="small" @click="onCopy">
      <CopyOutlined />复制
    </a-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";
import { Button } from "ant-design-vue";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons-vue";
import { copyTextToClipboard } from "@/utils";
export default defineComponent({
  components: {
    [Button.name]: Button,
    CopyOutlined,
    CheckOutlined,
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
  },
  setup(props) {
    const isCopySuccess = ref(false);
    function onCopy() {
      props.code && copyTextToClipboard(props.code);
      isCopySuccess.value = true;
      setTimeout(() => {
        isCopySuccess.value = false;
      }, 1000);
    }
    return { onCopy, isCopySuccess };
  },
});
</script>

<style lang="less" scoped>
.code-highlight-wraper {
  position: relative;
  .copy-button {
    position: absolute;
    top: 5px;
    right: 5px;
    display: none;
  }
  &:hover {
    .copy-button {
      display: block;
    }
  }
}
</style>
