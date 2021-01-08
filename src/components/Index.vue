<template>
  <div :class="[`layout-size_${currentSize}`]">
    <Header
      ref="header"
      :config="config"
      :apiData="apiData"
      :device="device"
      @onVersionChange="getApiList"
      @showSideMenu="onShowSideMenu"
    />
    <div class="spin-box" v-if="loading">
      <Spin tip="Loading..." :spinning="loading"> </Spin>
    </div>
    <div v-else>
      <splitpanes style="height: calc(100vh - 50px)">
        <pane v-if="device != 'mobile'" size="20" min-size="20" max-size="40">
          <Card
            :bordered="false"
            style="height:100%"
            :bodyStyle="{ padding: 0 }"
          >
            <DocMenu
              :apiData="apiData.list"
              :groups="apiData.groups"
              @change="menuChange"
            />
          </Card>
        </pane>
        <pane :size="device != 'mobile' ? 70 : 100">
          <Card
            :bordered="false"
            style="height:100%;overflow: auto;"
            :bodyStyle="{ padding: device == 'mobile' ? '10px' : '24px' }"
          >
            <DocApiContent
              v-if="currentApiData && currentApiData.title"
              :apiData="currentApiData"
              :responses="apiData.responses"
            />
            <DocHome v-else :apiData="apiData" :config="config" />
          </Card>
        </pane>
      </splitpanes>
      <Drawer
        v-if="device == 'mobile'"
        :title="config && config.title ? config.title : 'Api Doc'"
        placement="left"
        :visible="visible.sideMenu"
        width="80%"
        :bodyStyle="{ padding: 0 }"
        @close="onSideMenuClose"
      >
        <DocMenu
          :apiData="apiData.list"
          :groups="apiData.groups"
          @change="menuChange"
        />
      </Drawer>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import { Card, Spin, Drawer } from "ant-design-vue";
import DocMenu from "./Menu";
import DocApiContent from "./content";
import DocHome from "./DocHome";
import VueClipboard from "vue-clipboard2";
import { ls } from "@/utils/cache";
import { setCurrentUrl, getUrlQuery } from "@/utils/utils";
import PasswordModal from "./auth/passwordModal";
import responsiveMixin from "@/utils/responsive";
import { getConfig, getData } from "@/api/app";

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
    Header,
    Drawer
  },
  mixins: [responsiveMixin],
  data() {
    return {
      loading: true,
      apiData: {},
      currentApiData: {},
      config: {},
      visible: {
        sideMenu: false
      }
    };
  },
  created() {
    const urlQuery = getUrlQuery();
    this.getConfig([urlQuery.version]);

    // this.getApiList();
  },
  methods: {
    getApiList(version = "", cacheFileName = "", reload = false) {
      const { config } = this;
      if (!version && config && config.versions && config.versions.length) {
        version = this.config.versions[0].title;
      }
      this.loading = true;
      getData({
        version: version,
        cacheFileName: cacheFileName,
        reload: reload
      })
        .then(res => {
          this.loading = false;
          const json = {
            ...res.data.data,
            version: version
          };
          this.apiData = json;
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
      getConfig()
        .then(res => {
          if (res.data && res.data.title) {
            this.config = res.data;
          } else if (res.data && res.data.data) {
            this.config = res.data.data;
          }
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
            window.location.reload();
          }
        });
      } else {
        that.getApiList(...option);
      }
    },
    // 显示移动端侧边栏
    onShowSideMenu() {
      this.visible.sideMenu = true;
    },
    onSideMenuClose() {
      this.visible.sideMenu = false;
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
