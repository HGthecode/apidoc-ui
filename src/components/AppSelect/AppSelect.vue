<template>
  <div class="app-select">
    <a-select
      :value="appKey"
      class="app-select_select"
      option-label-prop="label"
      @change="onChange"
    >
      <template v-for="item in config.apps" :key="item.folder">
        <template v-if="item.items && item.items.length">
          <a-select-opt-group :label="item.title">
            <a-select-option
              v-for="option in item.items"
              :key="`${item.folder}_${option.folder}`"
              :value="`${item.folder}_${option.folder}`"
              :label="`${item.title}-${option.title}`"
              >{{ option.title }}</a-select-option
            >
          </a-select-opt-group>
        </template>
        <template v-else>
          <a-select-option :value="`${item.folder}`" :label="`${item.title}`">{{
            item.title
          }}</a-select-option>
        </template>
      </template>
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
    ASelectOptGroup: Select.OptGroup,
  },
  setup() {
    let store = useStore<GlobalState>();
    const state = reactive({
      count: 0,
      config: computed(() => store.state.app.config),
      feConfig: computed(() => store.state.app.feConfig),
      appKey: computed(() => store.state.app.appKey),
    });

    // const router = useRouter();
    const onChange = (appKey: string) => {
      // router.push({
      //   name: "ApiDetail",
      //   query: {
      //     appKey,
      //   },
      // });
      store.dispatch(`app/${Types.SET_APP_KEY}`, appKey);
    };

    return { ...toRefs(state), onChange };
  },
});
</script>
<style lang="less" scoped>
.app-select {
  display: inline-block;
  margin-right: 10px;
  &_select {
    width: 140px;
  }
}
</style>
