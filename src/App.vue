<template>
  <router-view />
</template>
<script lang="ts">
import { defineComponent, watch } from "vue";
import { GlobalState } from "@/store";
import { useStore } from "vuex";
import * as Types from "@/store/modules/App/types";
import { useMediaQuery } from "@vueuse/core";

export default defineComponent({
  name: "App",
  setup: () => {
    let store = useStore<GlobalState>();

    const isMobile = useMediaQuery("(max-width: 1024px)");
    store.dispatch(`app/${Types.SET_IS_MOBILE}`, isMobile.value);
    watch(
      () => isMobile.value,
      (v) => {
        console.log("isMobile", v);
        store.dispatch(`app/${Types.SET_IS_MOBILE}`, v);
      }
    );

    // store.dispatch(`app/${Types.GET_CONFIG_INFO}`).then((res) => {
    // });
  },
});
</script>
