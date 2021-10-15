<template>
  <a-switch
    class="dark-switch"
    :checked="theme === 'dark'"
    checked-children="🌙"
    un-checked-children="🌞"
    @change="onChange"
  />
</template>

<script lang="ts">
import { Switch } from "ant-design-vue";
import { reactive, defineComponent, toRefs, computed } from "vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import * as Types from "@/store/modules/App/types";
import Cache from "@/utils/cache";

export default defineComponent({
  components: {
    [Switch.name]: Switch,
  },
  setup() {
    let store = useStore<GlobalState>();
    const state = reactive({
      theme: computed(() => store.state.app.theme),
      feConfig: computed(() => store.state.app.feConfig),
    });

    const onChange = (checked: boolean) => {
      const theme = checked ? "dark" : "light";
      Cache.set(Types.APP_THEME, theme);
      store.dispatch(`app/${Types.SET_APP_THEME}`, theme);
    };

    return { ...toRefs(state), onChange };
  },
});
</script>
<style lang="less" scoped>
.dark-switch {
  background: var(--bgcolor-mask);
}
</style>
