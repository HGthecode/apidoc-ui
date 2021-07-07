<template>
  <div class="search-wraper">
    <app-select />
    <a-input-search
      placeholder="名称 URL 描述"
      @search="onSearch"
      :allowClear="true"
    ></a-input-search>
  </div>
</template>

<script lang="ts">
import { Input } from "ant-design-vue";
import { reactive, defineComponent, toRefs, computed } from "vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import * as Types from "@/store/modules/App/types";
import AppSelect from "@/components/AppSelect";

export default defineComponent({
  components: {
    AppSelect,
    [Input.Search.name]: Input.Search,
  },
  emits: ["search"],
  setup(props, { emit }) {
    let store = useStore<GlobalState>();
    const state = reactive({
      sideWidth: computed(() => store.state.app.sideWidth),
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
