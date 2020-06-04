<template>
  <div>
    <div class="api-home-content">
      <h1>{{ apiData.title }}</h1>
      <div class="version">Version：{{ apiData.version }}</div>
      <div>{{ apiData.copyright }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    apiData: {
      type: Object,
      default: () => {}
    }
  }
};
</script>

<style lang="less" scoped>
.api-home-content {
  text-align: center;
  padding: 100px 0;
  h1 {
    font-size: 40px;
  }
  .version {
    font-size: 18px;
  }
}
</style>
