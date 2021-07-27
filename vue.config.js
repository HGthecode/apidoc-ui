// eslint-disable-next-line @typescript-eslint/no-var-requires
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
  publicPath: "./",
  outputDir: "apidoc",
  assetsDir: "static",
  // productionSourceMap: false,
  devServer: {
    port: 9999,
  },
  configureWebpack: {
    plugins: [new MonacoWebpackPlugin()],
  },
  chainWebpack: (config) => {
    // 移除 prefetch 插件
    config.plugins.delete("prefetch");
  },
  // css: {
  //   modules: true,
  // },
};
