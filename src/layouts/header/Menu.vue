<template>
  <div class="header-menus">
    <router-link :to="{ name: 'ApiDetail' }">API</router-link>
    <router-link :to="{ name: 'MdDetail' }">文档</router-link>
  </div>
</template>

<style lang="less" scoped>
.header-menus {
  display: inline-block;
  & > a {
    display: inline-block;
    padding: 0 5px 5px;
    font-size: 16px;
    position: relative;
    line-height: 38px;
    color: var(--text-color);
    &:after {
      position: absolute;
      content: " ";
      left: 50%;
      right: 50%;
      bottom: 0;
      height: 2px;
      background: var(--theme-color);
      border-radius: 1px;
      visibility: hidden;
      transition: left 0.2s ease-in-out, right 0.2s ease-in-out;
    }
    &.router-link-active {
      color: var(--theme-color);
    }
    &:hover:after,
    &.router-link-active:after {
      left: 0;
      right: 0;
      visibility: visible;
    }
  }
  & > a + a {
    margin-left: 15px;
  }
}
</style>
