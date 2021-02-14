<template>
  <div :class="['header', device]">
    <div class="logo-box">
      <div
        v-if="device == 'mobile'"
        class="header-menu-button"
        @click="onShowMenuClick"
      >
        <Icon type="menu" />
      </div>
      <div class="logo">
        <img :src="logoPath" alt="" />
      </div>
      <div
        v-if="
          !(device == 'mobile' && config && (config.cache || config.with_cache))
        "
        class="logo-text"
      >
        {{ config && config.title ? config.title : "Api Doc" }}
      </div>
    </div>
    <div class="header-menu"></div>
    <div class="user-wrapper">
      <div class="select-app" v-if="apps.length">
        <span v-if="device != 'mobile'"
          >{{
            config.apps_title
              ? config.apps_title
              : this.config.versions
              ? "Select Version"
              : "App/Version"
          }}:
        </span>
        <app-select
          :style="{
            width: device == 'mobile' ? '100px' : '170px'
          }"
          :value="currentApp"
          :options="apps"
          @change="onAppChange"
        />
      </div>

      <div
        class="select-log"
        v-if="
          config &&
            (config.cache || config.with_cache) &&
            apiData &&
            apiData.cacheFiles &&
            apiData.cacheFiles.length
        "
      >
        <Select
          v-model="currentCache"
          :style="{
            width: device == 'mobile' ? '100px' : '170px'
          }"
          @change="onCacheChange"
        >
          <SelectOption
            v-for="(item, index) in apiData.cacheFiles"
            :key="index"
            :value="item"
          >
            {{ item }}
          </SelectOption>
        </Select>
      </div>
      <div class="actions">
        <Tooltip placement="bottom">
          <template slot="title">
            Set Global Authorize
          </template>
          <Button
            v-if="isGlobalAuth"
            icon="safety-certificate"
            type="primary"
            @click="showGlobalAuth"
            ><span v-if="device != 'mobile'">Authorize</span></Button
          >
          <Button v-else icon="safety-certificate" @click="showGlobalAuth"
            ><span v-if="device != 'mobile'">Authorize</span></Button
          >
        </Tooltip>

        <Tooltip
          v-if="
            (config && config.with_cache) ||
              (config && config.cache && config.cache.enable && config.debug)
          "
          placement="bottom"
        >
          <template slot="title">
            重新生成接口数据
          </template>

          <Button icon="reload" @click="reloadData" style="margin-left:8px;"
            ><span v-if="device != 'mobile'">Reload</span></Button
          >
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import { Select, Tooltip, Button, Icon } from "ant-design-vue";
import GlobalAuthModal from "./auth/globalAuthModal";
import AppSelect from "./AppSelect";
import { ls } from "@/utils/cache";

export default {
  components: {
    Select,
    SelectOption: Select.Option,
    Tooltip,
    Button,
    Icon,
    AppSelect
  },
  props: {
    config: {
      type: Object,
      default: () => {}
    },
    apiData: {
      type: Object,
      default: () => {}
    },
    device: {
      type: String,
      default: "xl"
    }
  },
  data() {
    return {
      isGlobalAuth: false,
      currentCache: "",
      logoPath: "./logo.png",
      currentApp: ""
    };
  },
  computed: {
    apps() {
      if (this.config.apps && this.config.apps.length) {
        return this.config.apps;
      } else if (this.config.versions && this.config.versions.length) {
        return this.config.versions;
      }
      return [];
    }
  },
  watch: {
    apiData(val) {
      this.currentCache = val.cacheName;
      this.currentApp = val.appKey;
    }
  },
  created() {
    const globalAuth = ls.get("globalAuth");
    if (globalAuth) {
      this.isGlobalAuth = true;
    }
  },
  methods: {
    showGlobalAuth() {
      GlobalAuthModal({
        success: this.setGlobalAuthSuccess
      });
    },
    setGlobalAuthSuccess(val) {
      if (val) {
        this.isGlobalAuth = true;
      } else {
        this.isGlobalAuth = false;
      }
    },
    onCacheChange(val) {
      this.$emit("cacheChange", this.currentApp, val);
    },
    reloadData() {
      this.$emit("reload", this.currentApp, "", true);
    },
    onShowMenuClick() {
      this.$emit("showSideMenu");
    },
    onAppChange(key) {
      if (this.config.versions && this.config.versions.length) {
        const find = this.config.versions.find(p => p.folder === key);
        this.$emit("appChange", find.title);
      } else {
        this.$emit("appChange", key);
      }
    }
  }
};
</script>
<style lang="less" scoped>
.header {
  width: 100%;
  height: 40px;
  background: #fafafa;
  border-bottom: 1px solid #ddd;
  display: flex;
  padding: 0 30px;
  &.mobile {
    padding: 0 10px;
  }
  .header-menu-button {
    float: left;
    text-align: center;
    font-size: 20px;
    padding-right: 15px;
    padding-left: 5px;
  }
  .logo-box {
    padding: 4px 0;
    overflow: hidden;
    .logo {
      float: left;
      & > img {
      }
    }

    .logo-text {
      float: left;
      line-height: 32px;
      margin-left: 10px;
      font-weight: bold;
    }
  }
  .header-menu {
    flex: 1;
  }
  .user-wrapper {
    display: flex;
    .select-app {
      padding: 4px;
      flex: 1;
    }
    .select-log {
      padding: 4px;
    }
    .actions {
      // margin-left: 16px;
      padding: 4px;
      .action {
        padding: 10px;
        display: inline-block;
        color: #555;
      }
    }
  }
}
</style>
