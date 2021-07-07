<template>
  <a-switch class="dark-switch" checked-children="🌙" un-checked-children="🌞" @change="onChange" />
</template>

<script lang="ts">
  import { Switch } from 'ant-design-vue';
  import { reactive, defineComponent, toRefs, computed } from 'vue';
  import { useStore } from 'vuex';
  import { GlobalState } from '@/store';
  import * as Types from '@/store/modules/App/types';

  export default defineComponent({
    components: {
      [Switch.name]: Switch,
    },
    setup() {
      let store = useStore<GlobalState>();
      const state = reactive({
        count: 0,
        feConfig: computed(() => store.state.app.feConfig),
      });

      const onChange = (checked: boolean) => {
        console.log(checked);
        const theme = checked ? 'dark' : 'light';
        store.dispatch(`app/${Types.SET_APP_THEME}`, theme);
      };

      return { ...toRefs(state), onChange };
    },
  });
</script>
<style lang="less" scoped>
  .dark-switch {
    margin-right: 16px;
    background: var(--bgcolor-mask);
  }
</style>
