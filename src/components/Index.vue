<template>
  <div>
    <Header
      ref="header"
      :config="config"
      :apiData="apiData"
      @onVersionChange="getApiList"
    />
    <div class="spin-box" v-if="loading">
      <Spin tip="Loading..." :spinning="loading"> </Spin>
    </div>
    <div v-else>
      <splitpanes style="height: calc(100vh - 50px)">
        <pane size="20" min-size="20" max-size="40">
          <Card
            :bordered="false"
            style="height:100%"
            :bodyStyle="{ padding: 0 }"
          >
            <DocMenu :apiData="apiData.list" @change="menuChange" />
          </Card>
        </pane>
        <pane size="70">
          <Card :bordered="false" style="height:100%;overflow: auto;">
            <DocApiContent
              v-if="currentApiData && currentApiData.title"
              :apiData="currentApiData"
              :responses="apiData.responses"
            />
            <DocHome v-else :apiData="apiData" />
          </Card>
        </pane>
      </splitpanes>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import { Card, Spin } from "ant-design-vue";
import DocMenu from "./Menu";
import DocApiContent from "./content";
import DocHome from "./DocHome";
import VueClipboard from "vue-clipboard2";
import { sendRequest } from "./utils/request";
import { ls } from "./utils/cache";
import { setCurrentUrl, getUrlQuery } from "./utils/utils";
import PasswordModal from "./auth/passwordModal";

import Header from "./Header";
import "./index.less";
Vue.use(VueClipboard);
export default {
  components: {
    Card,
    Spin,
    Splitpanes,
    Pane,
    DocMenu,
    DocApiContent,
    DocHome,
    Header
  },
  data() {
    return {
      loading: true,
      apiData: {},
      currentApiData: {},
      config: {}
    };
  },
  created() {
    const urlQuery = getUrlQuery();
    this.getConfig([urlQuery.version]);

    // this.getApiList();
  },
  methods: {
    getApiList(version = "", cacheFileName = "", reload = false) {
      if (
        !version &&
        this.config &&
        this.config.versions &&
        this.config.versions.length
      ) {
        version = this.config.versions[0].folder;
      }
      this.loading = true;
      sendRequest(
        "/apidoc/data",
        { version: version, cacheFileName: cacheFileName, reload: reload },
        "get"
      )
        .then(res => {
          this.loading = false;
          this.apiData = res.data.data;
          this.currentApiData = {};
          // 更新url
          const url = `${window.location.protocol}//${window.location.host}${
            window.location.pathname
          }?version=${version ? version : ""}`;
          setCurrentUrl(url);
        })
        .catch(err => {
          const status =
            err.response && err.response.status ? err.response.status : 500;
          if (status === 401) {
            ls.remove("token");
            this.verifyAuth();
          }
        });
    },
    menuChange(currentApiData) {
      this.currentApiData = currentApiData;
    },
    getConfig(option) {
      sendRequest("/apidoc/config", {}, "get")
        .then(res => {
          this.config = res.data;
          ls.set("config", this.config);
          this.verifyAuth(option);
        })
        .catch(() => {});
    },
    verifyAuth(option) {
      const that = this;
      const token = ls.get("token");
      if (!token && this.config.auth && this.config.auth.with_auth) {
        // 不存在token并需要登录
        // 密码验证方法
        PasswordModal({
          success: () => {
            that.getApiList(...option);
          }
        });
      } else {
        that.getApiList(...option);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.spin-box {
  width: 100%;
  height: 100vh;
  text-align: center;
  padding-top: 100px;
}
</style>
