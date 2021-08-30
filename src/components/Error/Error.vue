<template>
  <div class="error-box">
    <div class="error-status">
      <div><WarningOutlined /></div>
      <div>{{ status }}</div>
    </div>
    <div>
      <p>ApiUrl: {{ error.config.baseURL }}{{ error.config.url }}</p>
    </div>
    <div class="error-message">{{ message }}</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { WarningOutlined } from "@ant-design/icons-vue";
import { AxiosError } from "axios";

export default defineComponent({
  components: {
    WarningOutlined,
  },
  props: {
    error: {
      type: Object as PropType<AxiosError>,
      default: () => {
        return {};
      },
    },
  },
  setup(props) {
    const message = computed(() => {
      const error = props.error;
      return error.response && error.response.data && error.response.data.message
        ? (error.response.data.message as string)
        : (error.message as string);
    });
    const status = computed(() => {
      const error = props.error;
      return error.response && error.response.status ? error.response.status : 500;
    });
    return { status, message };
  },
});
</script>
<style lang="less" scoped>
.error-box {
  padding: 50px 100px;
  text-align: center;
  .error-status {
    font-size: 50px;
    color: #ff4d4f;
  }
  .error-message {
    font-size: 16px;
    padding: 10px;
    background: #282c34;
    border-radius: 6px;
    color: #ddd;
    margin-bottom: 20px;
  }
}
</style>
