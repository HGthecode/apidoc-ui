<template>
  <a class="header-logo">
    <img class="header-logo_img" src="../../assets/logo.png" />
    <span class="header-logo_title">Apidoc</span>
  </a>
</template>

<style lang="less" scoped>
  .header-logo {
    &_img {
      vertical-align: top;
      margin-right: 16px;
      display: inline-block;
    }
    &_title {
      color: var(--text-color);
      font-size: 20px;
      position: relative;
      display: inline-block;
      line-height: 1.2;
    }
  }
</style>
