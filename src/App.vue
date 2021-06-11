<template>
  <router-view />
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { GlobalState } from '@/store';
  import { useStore } from 'vuex';
  import * as Types from '@/store/modules/App/types';

  export default defineComponent({
    name: 'App',
    setup: () => {
      let store = useStore<GlobalState>();
      store.dispatch(`app/${Types.GET_CONFIG_INFO}`);
    },
  });
</script>
