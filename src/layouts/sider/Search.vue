<template>
  <div class="search-wraper">
    <a-space>
      <app-select :value="appKey" />
      <a-input-search placeholder="名称 URL" @search="onSearch" :allowClear="true"></a-input-search>
    </a-space>
  </div>
</template>

<script lang="ts">
import { Input, Space } from "ant-design-vue";
import { reactive, defineComponent, toRefs, computed } from "vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import AppSelect from "@/components/AppSelect";

export default defineComponent({
  components: {
    AppSelect,
    [Input.Search.name]: Input.Search,
    [Space.name]: Space,
  },
  emits: ["search"],
  setup(props, { emit }) {
    let store = useStore<GlobalState>();
    const state = reactive({
      sideWidth: computed(() => store.state.app.sideWidth),
      appKey: computed(() => store.state.app.appKey),
    });

    const onSearch = (keyword: string) => {
      emit("search", keyword);
    };

    return { ...toRefs(state), onSearch };
  },
});
</script>
<style lang="less" scoped>
.search-wraper {
  display: flex;
  // padding: 10px 10px 0;
}
</style>
