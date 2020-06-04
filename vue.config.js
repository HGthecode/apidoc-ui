const Timestamp = new Date().getTime();
const vueConfig = {
  publicPath: "",
  //静态资源打包到该文件夹
  assetsDir: "static",
  // outputDir: "",

  configureWebpack: {
    output: {
      // 输出重构  打包编译后的 文件名称  【模块名称.版本号.时间戳】
      filename: `static/js/[name].${Timestamp}.js`,
      chunkFilename: `static/js/[name].${Timestamp}.js`
    }
  },
  css: {
    loaderOptions: {
      less: {
        globalVars: {
          "main-color": "#1989fa",
          red: "#f44",
          green: "#07c160"
        }
      }
    }
  },
  devServer: {
    port: 9998
  }
};

module.exports = vueConfig;
