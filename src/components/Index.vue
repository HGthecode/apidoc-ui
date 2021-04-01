<template>
  <div :class="[`layout-size_${currentSize}`]">
    <Header
      ref="header"
      :config="config"
      :apiData="apiData"
      :device="device"
      @cacheChange="getApiList"
      @reload="getApiList"
      @appChange="getApiList"
      @showSideMenu="onShowSideMenu"
    />
    <div class="spin-box" v-if="loading">
      <Spin tip="Loading..." :spinning="loading"> </Spin>
    </div>
    <div class="error-box" v-else-if="error.status">
      <div class="error-status">
        <div><Icon type="warning" /></div>
        <div>{{ error.status }}</div>
      </div>
      <div class="error-message">{{ error.message }}</div>
      <div>
        <Button icon="reload" size="large" @click="reloadPage">刷新</Button>
      </div>
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
              :tags="apiData.tags"
              :docs="apiData.docs"
              :config="config"
              @change="menuChange"
              @showCrud="onShowCrud"
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
              v-if="currentApiData && currentApiData.url"
              :apiData="currentApiData"
              :config="config"
            />
            <DocMdContent
              v-else-if="currentDocData && currentDocData.type === 'md'"
              :docData="currentDocData"
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
          :tags="apiData.tags"
          :docs="apiData.docs"
          :config="config"
          :device="device"
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
import { Card, Spin, Drawer, Icon, Button } from "ant-design-vue";
import DocMenu from "./Menu";
import DocApiContent from "./content";
import DocHome from "./DocHome";
import VueClipboard from "vue-clipboard2";
import { ls } from "@/utils/cache";
import { setCurrentUrl, getUrlQuery, getTreeFirstNode } from "@/utils/utils";
import PasswordModal from "./auth/passwordModal";
import responsiveMixin from "@/utils/responsive";
import { getConfig, getData } from "@/api/app";
import DocMdContent from "./DocMdContent";
import CrudModal from "./crud";

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
    Drawer,
    DocMdContent,
    Icon,
    Button
  },
  mixins: [responsiveMixin],
  data() {
    return {
      loading: true,
      apiData: {},
      currentApiData: {},
      currentDocData: {},
      currentAppKey: "",
      config: {},
      visible: {
        sideMenu: false
      },
      error: {
        status: "",
        message: ""
      },
      clientWidth: 1920
    };
  },
  created() {
    const urlQuery = getUrlQuery();
    this.getConfig([urlQuery.appKey]);
    this.currentAppKey = urlQuery.appKey;

    // this.getApiList();
  },
  mounted() {
    this.clientWidth = document.body.clientWidth;
  },
  methods: {
    getApiList(appKey = "", cacheFileName = "", reload = false) {
      const { verifyAuth } = this;
      let version = null;
      if (appKey) {
        this.currentAppKey = appKey;
        if (this.config.versions && this.config.versions.length) {
          version = this.currentAppKey;
        }
      } else {
        // 默认版本/应用
        if (!this.currentAppKey && this.config.apps) {
          const firstNodes = getTreeFirstNode(this.config.apps, "items");
          if (firstNodes && firstNodes.length) {
            const keys = firstNodes.map(p => p.folder);
            this.currentAppKey = keys.join("_");
          }
        } else if (
          !this.currentAppKey &&
          this.config.versions &&
          this.config.versions.length
        ) {
          // 兼容低版本versions
          const firstNode = this.config.versions[0];
          if (firstNode) {
            this.currentAppKey = firstNode["title"];
            version = this.currentAppKey;
          }
        }
      }
      this.loading = true;
      getData({
        appKey: this.currentAppKey,
        version: version,
        cacheFileName: cacheFileName,
        reload: reload
      })
        .then(res => {
          this.loading = false;
          const json = {
            ...res.data.data,
            appKey: this.currentAppKey
          };
          this.apiData = json;
          this.currentApiData = {};
          this.currentDocData = {};
          // 更新url
          const url = `${window.location.protocol}//${window.location.host}${
            window.location.pathname
          }?appKey=${this.currentAppKey}`;
          setCurrentUrl(url);
        })
        .catch(err => {
          const status =
            err.response && err.response.status ? err.response.status : 500;
          if (status === 401) {
            ls.remove("token");
            verifyAuth();
          } else {
            this.error = {
              status: status,
              message:
                err.response && err.response.data && err.response.data.message
                  ? err.response.data.message
                  : err.message
            };
            this.loading = false;
          }
        });
    },
    menuChange(currentApiData) {
      if (currentApiData.type === "md") {
        // docs文档
        this.currentDocData = currentApiData;
        this.currentApiData = {};
      } else {
        this.currentApiData = currentApiData;
        this.currentDocData = {};
      }
      this.visible.sideMenu = false;
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
          document.title = this.config.title;
          this.verifyAuth(option);
        })
        .catch(err => {
          const status =
            err.response && err.response.status ? err.response.status : 404;
          this.error = {
            status: status,
            message:
              err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : err.message
          };
          this.loading = false;
        });
    },
    verifyAuth(option) {
      const that = this;
      const token = ls.get("token");
      if (
        !token &&
        this.config &&
        this.config.auth &&
        (this.config.auth.with_auth || this.config.auth.enable)
      ) {
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
    },
    onShowCrud() {
      const that = this;
      CrudModal({
        config: this.config,
        currentAppKey: this.currentAppKey,
        clientWidth: this.clientWidth,
        success: () => {
          that.getApiList();
        }
      });
    },
    reloadPage() {
      window.location.href = "/apidoc/";
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
.error-box {
  padding: 100px;
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
