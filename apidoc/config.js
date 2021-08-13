// eslint-disable-next-line no-unused-vars
const config = {
  // 标题
  TITLE: "Apidoc",
  // 请求host
  HOST: "http://demo.apidoc.com",
  // 菜单配置
  MENU: {
    // 是否显示控制器类名
    SHOW_CONTROLLER_CLASS: true,
    // 是否显示接口url
    SHOW_API_URL: true,
    // 是否显示接口请求类型
    SHOW_API_METHOD: true,
  },
  // 当字段无默认值时，使用字段类型为默认值
  USE_TYPE_DEFAULT_VALUE: true,
  // 多个可切换的host
  HOSTS: [
    {
      title: "本地测试",
      host: "http://demo.apidoc.com",
    },
    {
      title: "正式环境",
      host: "http://www.apidoc.net.cn",
    },
  ],
  // 缓存配置
  CACHE: {
    // 缓存前缀
    PREFIX: "apidoc_",
  },
  // 请求配置
  HTTP: {
    // 接口响应超时时间
    TIMEOUT: 30000,
  },
  // 多语言
  LANG: [
    {
      title: "简体中文",
      lang: "zh-cn",
      messages: {
        "app.title": "Apidoc",
        "home.title": "首页",
        "home.appCount": "应用数",
        "home.apiCount": "API数量",
        "home.docsCount": "文档数量",
        "common.ok": "确认",
        "common.cancel": "取消",
        "common.clear": "清空",
        "common.desc": "说明",
        "common.action": "操作",
        "common.field": "字段",
        "common.type": "类型",
        "common.require": "必填",
        "common.defaultValue": "默认值",
        "common.value": "值",
        "common.api": "API",
        "common.docs": "文档",
        "common.close": "关闭",
        "common.view": "查看",
        "common.copySuccess": "复制成功",
        "common.page.404": "404-未知页面",
        "common.notdata": "暂无数据",
        "common.group": "分组",
        "common.currentApp": "当前应用",
        "lang.change.confirm.title": "您确认切换语言为 {langTitle} 吗？",
        "lang.change.confirm.content": "确认后将刷新页面，并回到首页",

        "auth.title": "授权访问",
        "auth.input.placeholder": "请输入访问密码",

        "apiPage.update.tip": "该接口有更新",
        "apiPage.update.button": "点击此处更新",
        "apiPage.author": "作者",
        "apiPage.tag": "标签",
        "apiPage.docs": "文档",
        "apiPage.json": "Json",
        "apiPage.debug": "调试",
        "apiPage.title.header": "请求头Headers",
        "apiPage.title.params": "请求参数Parameters",
        "apiPage.title.responses": "响应结果Responses",
        "apiPage.mdDetail.title": "{name} 字段的说明",
        "apiPage.debug.mock.reload": "更新Mock",
        "apiPage.debug.excute": "执行 Excute",

        "layout.menu.reload": "更新菜单",
        "layout.menu.openAll": "展开全部",
        "layout.menu.hideAll": "收起全部",
        "layout.cache.reload": "更新缓存",
        "layout.tabs.leftSide": "左侧",
        "layout.tabs.rightSide": "右侧",
        "layout.tabs.notTab": "没有标签",
        "layout.tabs.closeCurrent": "关闭当前",
        "layout.tabs.closeLeft": "关闭左侧",
        "layout.tabs.closeRight": "关闭右侧",
        "layout.tabs.closeAll": "关闭全部",

        "globalParam.title": "全局参数",
        "globalParam.header": "Header",
        "globalParam.header.message": "发送请求时，所有接口将自动携带以下Header参数。",
        "globalParam.params": "Params",
        "globalParam.params.message": "发送请求时，所有接口将自动携带以下Params参数。",
        "globalParam.cancel.confirm": "确认清空以上所有参数吗?",
        "globalParam.add": "添加参数",
      },
    },
    {
      title: "Engilsh",
      lang: "en-us",
      messages: {
        "app.title": "Apidoc",
        "home.title": "Home",
        "home.appCount": "App Count",
        "home.apiCount": "API Count",
        "home.docsCount": "Docs Count",
        "common.ok": "Ok",
        "common.cancel": "Cancel",
        "common.clear": "Clear",
        "common.desc": "Describe",
        "common.action": "Action",
        "common.field": "Field",
        "common.type": "Type",
        "common.require": "Require",
        "common.defaultValue": "DefaultValue",
        "common.value": "Value",
        "common.api": "API",
        "common.docs": "Docs",
        "common.close": "Close",
        "common.view": "View",
        "common.copySuccess": "Copy Success",
        "common.page.404": "404-page",
        "common.notdata": "No Data",
        "common.group": "Group",
        "common.currentApp": "Current App",
        "lang.change.confirm.title": "Are you switch the language to {langTitle} ?",
        "lang.change.confirm.content":
          "After confirmation, the page will refresh and return to the home page",

        "auth.title": "Authorized Access",
        "auth.input.placeholder": "Please input the access password",

        "apiPage.update.tip": "The Api has been updated",
        "apiPage.update.button": "Click here to update",
        "apiPage.author": "Author",
        "apiPage.tag": "Tag",
        "apiPage.docs": "Docs",
        "apiPage.json": "Json",
        "apiPage.debug": "Debug",
        "apiPage.debug.mock.reload": "Reload Mock",
        "apiPage.debug.excute": "Excute",
        "apiPage.title.header": "Headers",
        "apiPage.title.params": "Parameters",
        "apiPage.title.responses": "Responses",
        "apiPage.mdDetail.title": "{name} Field Describe",

        "layout.menu.reload": "Updated Menu",
        "layout.menu.openAll": "Open All",
        "layout.menu.hideAll": "Hide All",
        "layout.cache.reload": "Reload Cache",
        "layout.tabs.leftSide": "Left Side",
        "layout.tabs.rightSide": "Right Side",
        "layout.tabs.notTab": "Not Tab",
        "layout.tabs.closeCurrent": "Close Current",
        "layout.tabs.closeLeft": "Close Left",
        "layout.tabs.closeRight": "Close Right",
        "layout.tabs.closeAll": "Close All",

        "globalParam.title": "Global Param",
        "globalParam.header": "Header",
        "globalParam.header.message":
          "When send a request, all Api will auto carry the following header。",
        "globalParam.params": "Params",
        "globalParam.params.message":
          "When send a request, all Api will auto carry the following params。",
        "globalParam.cancel.confirm": "Are you sure to clear all the above parameters?",
        "globalParam.add": "Add Param",
      },
    },
  ],
};

localStorage.APIDOC_CONFIG = JSON.stringify(config);
