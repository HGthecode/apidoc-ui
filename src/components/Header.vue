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
      <div
        class="select-version"
        v-if="config && config.versions && config.versions.length"
      >
        <span v-if="device != 'mobile'">Select Version </span>
        <Select
          v-model="currentVersion"
          :style="{
            width: device == 'mobile' ? '80px' : '120px'
          }"
          @change="onVersionChange"
        >
          <SelectOption
            v-for="(item, index) in config.versions"
            :key="index"
            :value="item.title"
          >
            {{ item.title }}
          </SelectOption>
        </Select>
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
              (config &&
                config.cache &&
                config.cache.enable &&
                config.cache.reload !== false)
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
import { ls } from "@/utils/cache";

export default {
  components: {
    Select,
    SelectOption: Select.Option,
    Tooltip,
    Button,
    Icon
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
      currentVersion: "",
      currentCache: "",
      logoPath: "./logo.png"
    };
  },
  watch: {
    apiData(val) {
      this.currentCache = val.cacheName;
      this.currentVersion = val.version;
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
    onVersionChange(val) {
      this.$emit("onVersionChange", val);
    },
    onCacheChange(val) {
      this.$emit("onVersionChange", this.currentVersion, val);
    },
    reloadData() {
      this.$emit("onVersionChange", this.currentVersion, "", true);
    },
    onShowMenuClick() {
      this.$emit("showSideMenu");
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
    .select-version {
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
