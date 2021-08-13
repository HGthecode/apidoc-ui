<template>
  <div v-if="feConfig.HOSTS && feConfig.HOSTS.length" class="host-select">
    <a-select
      :value="currentHost"
      :class="['host-select_select', { mobile: isMobile }]"
      option-label-prop="label"
      @change="onChange"
    >
      <a-select-option
        v-for="item in feConfig.HOSTS"
        :key="item.host"
        :value="`${item.host}`"
        :label="`${item.title}`"
        >{{ item.title }}</a-select-option
      >
    </a-select>
  </div>
</template>

<script lang="ts">
import { Select } from "ant-design-vue";
import { reactive, defineComponent, toRefs, computed } from "vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
// import { useRouter } from "vue-router";
import * as Types from "@/store/modules/App/types";

export default defineComponent({
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
  },
  setup() {
    let store = useStore<GlobalState>();
    const state = reactive({
      count: 0,
      config: computed(() => store.state.app.config),
      feConfig: computed(() => store.state.app.feConfig),
      isMobile: computed(() => store.state.app.isMobile),
      currentHost: "",
    });
    state.currentHost = state.feConfig.HOST as string;

    const onChange = (currentHost: string) => {
      const data = state.feConfig;
      data.HOST = currentHost;
      store.dispatch(`app/${Types.SET_FE_CONFIG}`, data);
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
