<template>
  <div class="header">
    <div class="logo-box">
      <div class="logo">API</div>
      <div class="logo-text">
        {{ config && config.title ? config.title : "Api Doc" }}
      </div>
    </div>
    <div class="header-menu"></div>
    <div class="user-wrapper">
      <div
        class="select-version"
        v-if="config && config.versions && config.versions.length"
      >
        <span>Select Version </span>
        <Select
          v-model="currentVersion"
          style="width: 120px"
          @change="onVersionChange"
        >
          <SelectOption
            v-for="(item, index) in config.versions"
            :key="index"
            :value="item.folder"
          >
            {{ item.title }}
          </SelectOption>
        </Select>
      </div>
      <div
        class="select-log"
        v-if="
          config &&
            config.with_cache &&
            apiData &&
            apiData.cacheFiles &&
            apiData.cacheFiles.length
        "
      >
        <Select
          v-model="currentCache"
          style="width: 170px"
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
            >Authorize</Button
          >
          <Button v-else icon="safety-certificate" @click="showGlobalAuth"
            >Authorize</Button
          >
        </Tooltip>

        <Tooltip v-if="config && config.with_cache" placement="bottom">
          <template slot="title">
            重新生成接口数据
          </template>

          <Button icon="reload" @click="reloadData" style="margin-left:8px;"
            >Reload</Button
          >
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import { Select, Tooltip, Button } from "ant-design-vue";
import GlobalAuthModal from "./auth/globalAuthModal";
import { ls } from "./utils/cache";

export default {
  components: {
    Select,
    SelectOption: Select.Option,
    Tooltip,
    Button
  },
  props: {
    config: {
      type: Object,
      default: () => {}
    },
    apiData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      isGlobalAuth: false,
      currentVersion: "",
      currentCache: ""
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
    }
  }
};
</script>
<style lang="less" scoped>
@logoColor: #1890ff;
@logoTextColor: #f74455;
@logoBackground: #fff;
.header {
  width: 100%;
  height: 40px;
  background: #fafafa;
  border-bottom: 1px solid #ddd;
  display: flex;
  padding: 0 30px;
  .logo-box {
    padding: 4px 0;
    overflow: hidden;

    .logo {
      float: left;
      width: 28px;
      height: 32px;
      border-radius: 4px;
      background: @logoBackground;
      border: 2px solid @logoColor;
      text-align: center;
      color: @logoTextColor;
      position: relative;
      font-size: 12px;
      font-weight: bold;
      &::before,
      &::after {
        content: "";
        width: 10px;
        height: 2px;
        background: @logoColor;
        position: absolute;
        top: 18px;
        left: 2px;
      }
      &::after {
        width: 20px;
        top: 22px;
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
