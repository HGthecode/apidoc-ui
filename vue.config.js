// eslint-disable-next-line @typescript-eslint/no-var-requires
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

// eslint-disable-next-line @typescript-eslint/no-var-requires
process.env.VUE_APP_VERSION = require("./package.json").version;

module.exports = {
  publicPath: "./",
  outputDir: "apidoc",
  assetsDir: "static",
  productionSourceMap: false,
  devServer: {
    port: 9999,
  },
  configureWebpack: {
    plugins: [
      new MonacoWebpackPlugin({
        languages: ["json"],
        features: ["coreCommands"],
      }),
    ],
  },
  chainWebpack: (config) => {
    // 移除 prefetch 插件
    config.plugins.delete("prefetch");
    /* 添加分析工具 */
    if (process.env.NODE_ENV === "production") {
      config
        .plugin("webpack-bundle-analyzer")
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin)
        .end();
      config.plugins.delete("prefetch");
    }
  },
};
