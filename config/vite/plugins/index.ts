/**
 * @name createVitePlugins
 * @description 封装plugins数组统一调用
 */
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { ConfigSvgIconsPlugin } from './svgIcons'
import { AutoRegistryComponents } from './component'
import { AutoImportDeps } from './autoImport'
import { ConfigVisualizerConfig } from './visualizer'
import { ConfigCompressPlugin } from './compress'
import { ConfigRestartPlugin } from './restart'
import { ThemePreprocessor } from './theme'
import { themePreprocessorHmrPlugin } from '@zougt/vite-plugin-theme-preprocessor'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'
import { createHtmlPlugin } from 'vite-plugin-html'

import OptimizationPersist from 'vite-plugin-optimize-persist'
import PkgConfig from 'vite-plugin-package-config'

const APP_VERSION = require('../../../package.json').version

export function createVitePlugins(isBuild: boolean) {
  const vitePlugins: (Plugin | Plugin[])[] = [
    // vue支持
    vue(),
    // JSX支持
    vueJsx(),
    // 自动按需引入组件
    AutoRegistryComponents(),
    // 自动按需引入依赖
    AutoImportDeps(),
    // 开启.gz压缩  rollup-plugin-gzip
    ConfigCompressPlugin(),
    // 监听配置文件改动重启
    ConfigRestartPlugin(),
    // 代码编辑器
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'json', 'typescript'],
    }),
    // 预加载配置
    PkgConfig(),
    //预加载
    OptimizationPersist(),
    // 主题
    ThemePreprocessor(),
    // 主题热更新
    themePreprocessorHmrPlugin(),
    createHtmlPlugin({
      inject: {
        data: {
          injectScript: `<script src="./config.js?v=${APP_VERSION}"></script>`,
        },
      },
    }),
  ]

  // vite-plugin-svg-icons
  vitePlugins.push(ConfigSvgIconsPlugin(isBuild))

  // rollup-plugin-visualizer
  vitePlugins.push(ConfigVisualizerConfig())

  return vitePlugins
}
