<template>
  <div
    v-if="feConfig.HTTP && feConfig.HTTP.HOSTS && feConfig.HTTP.HOSTS.length > 1"
    class="host-select"
  >
    <a-select
      :value="currentHost"
      :class="['host-select_select', { mobile: isMobile }]"
      option-label-prop="label"
      @change="onChange"
    >
      <a-select-option
        v-for="item in feConfig.HTTP.HOSTS"
        :key="item.host"
        :value="`${item.host}`"
        :label="`${item.title}`"
        >{{ item.title }}</a-select-option
      >
    </a-select>
  </div>
</template>

<script lang="ts">
import { Select, Modal } from "ant-design-vue";
import { reactive, defineComponent, toRefs, computed } from "vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import { ConfigInfo } from "@/api/interface/config";
import { FeConfigState } from "@/store/modules/App/interface";
import { useI18n } from "@/hooks/useI18n";
import Cache from "@/utils/cache";
import { isArray } from "lodash";
import { reloadHomePage } from "@/utils";

export default defineComponent({
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
  },
  setup() {
    const { t } = useI18n();
    let store = useStore<GlobalState>();
    const state = reactive({
      config: computed<ConfigInfo>(() => store.state.app.config),
      feConfig: computed<FeConfigState>(() => store.state.app.feConfig),
      isMobile: computed<boolean>(() => store.state.app.isMobile),
      currentHost: "",
    });
    let currentHost = Cache.get("HOST");
    if (
      !currentHost &&
      state.feConfig.HTTP &&
      state.feConfig.HTTP.HOSTS &&
      isArray(state.feConfig.HTTP.HOSTS)
    ) {
      currentHost = state.feConfig.HTTP.HOSTS[0] && (state.feConfig.HTTP.HOSTS[0].host as string);
    }
    state.currentHost = currentHost;

    const onChange = (host: string) => {
      if (!(state.feConfig.HTTP && state.feConfig.HTTP.HOSTS)) {
        return false;
      }
      const find = state.feConfig.HTTP.HOSTS.find((p) => p.host === host);
      const hostTitle = find && find.title ? find.title : "";

      Modal.confirm({
        title: t("host.change.confirm.title", { hostTitle }),
        content: t("lang.change.confirm.content"),
        okText: t("common.ok"),
        cancelText: t("common.cancel"),
        onOk() {
          Cache.set("HOST", host);
          reloadHomePage();
        },
        onCancel() {
          state.currentHost = currentHost;
        },
      });
    };

    return { ...toRefs(state), onChange };
  },
});
</script>
<style lang="less" scoped>
.host-select {
  display: inline-block;
  &_select {
    width: 140px;
    &.mobile {
      width: 90px;
    }
  }
}
</style>
