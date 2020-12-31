const Timestamp = new Date().getTime();
const vueConfig = {
  publicPath: "",
  //静态资源打包到该文件夹
  assetsDir: "static",
  productionSourceMap: false,

  configureWebpack: {
    output: {
      // 输出重构  打包编译后的 文件名称  【模块名称.版本号.时间戳】
      filename: `static/js/[name].${Timestamp}.js`,
      chunkFilename: `static/js/[name].${Timestamp}.js`
    }
  },
  devServer: {
    port: 9998
  }
};

module.exports = vueConfig;
