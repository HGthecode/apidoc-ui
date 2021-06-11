<template>
  <div>
    <layout-header />
    <router-link :to="{ name: 'ApiDetail' }">api</router-link> -
    <router-link :to="{ name: 'MdDetail' }">md</router-link>

    <router-view />
  </div>
</template>
<script>
  import LayoutHeader from './header';
  export default {
    components: {
      LayoutHeader,
    },
  };
</script>
