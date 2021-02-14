<template>
  <Modal
    title="请输入验证密码"
    :width="500"
    :visible="visible"
    :destroyOnClose="true"
    :maskClosable="false"
    :closable="false"
    @cancel="handleCancel"
  >
    <div>
      <InputPassword
        placeholder="请输入密码"
        size="large"
        v-model="password"
        @keydown.enter="handleOk"
      />
    </div>
    <template slot="footer">
      <Button type="primary" @click="handleOk">确认</Button>
    </template>
  </Modal>
</template>

<script>
import { Modal, Button, Input, message } from "ant-design-vue";
import { verifyAuth } from "@/api/app";
import { ls } from "@/utils/cache";

import md5 from "js-md5";
export default {
  components: {
    Modal,
    Button,
    InputPassword: Input.Password
  },
  props: {
    success: Function,
    cancel: Function
  },
  data() {
    return {
      visible: false,
      loading: false,
      password: ""
    };
  },
  created() {},
  mounted() {
    this.visible = true;
  },
  methods: {
    handleCancel() {
      this.$emit("cancel");
      this.visible = false;
    },
    handleOk() {
      if (!this.password) {
        message.error("请输入验证密码");
        return;
      }
      this.login({ password: md5(this.password) });
    },
    login(values) {
      verifyAuth(values)
        .then(res => {
          let token = "";
          if (res && res.data && res.data.token) {
            token = res.data.token;
          } else if (res && res.data && res.data.data) {
            token = res.data.data;
          }

          if (token) {
            ls.set("token", token);
            this.$emit("success");
            this.visible = false;
          } else {
            message.error("验证错误，请联系管理员");
          }
        })
        .catch(err => {
          const msg =
            err.response && err.response.data && err.response.data.message
              ? err.response.data.message
              : "验证错误，请重新输入";
          message.error(msg);
        });
    }
  }
};
</script>

<style lang="less" scoped></style>
