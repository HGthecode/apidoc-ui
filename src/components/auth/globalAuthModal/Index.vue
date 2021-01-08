<template>
  <Modal
    title="Set Global Authorize"
    :width="600"
    :visible="visible"
    :destroyOnClose="true"
    :maskClosable="false"
    @cancel="handleCancel"
  >
    <div>
      <div>
        <p>数据将在请求头中进行传递，清空则不传递该参数</p>
        <p>Name: {{ key }}</p>
        <p>Value:</p>
      </div>
      <Input
        placeholder="请输入Token"
        size="large"
        v-model="token"
        :allowClear="true"
      />
    </div>
    <template slot="footer">
      <Button type="primary" @click="handleOk">确认</Button>
    </template>
  </Modal>
</template>

<script>
import { Modal, Button, Input, message } from "ant-design-vue";
import { ls } from "@/utils/cache";
export default {
  components: {
    Modal,
    Button,
    Input: Input
  },
  props: {
    config: {
      type: Object,
      default: () => {}
    },
    success: Function,
    cancel: Function
  },
  data() {
    return {
      visible: false,
      loading: false,
      token: "",
      key: ""
    };
  },
  created() {
    this.key =
      this.config && this.config.global_auth_key
        ? this.config.global_auth_key
        : "Authorization";
    this.token = ls.get("globalAuth");
  },
  mounted() {
    this.visible = true;
  },
  methods: {
    handleCancel() {
      this.$emit("cancel");
      this.visible = false;
    },
    handleOk() {
      ls.set("globalAuth", this.token);
      message.success("设置成功");
      this.visible = false;
      this.$emit("success", this.token);
    }
  }
};
</script>

<style lang="less" scoped></style>
