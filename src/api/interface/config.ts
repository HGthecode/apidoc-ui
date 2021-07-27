/**
 * 后端配置响应内容
 */
export interface ConfigInfo {
  allowCrossDomain?: boolean;
  apps?: ConfigAppItem[];
  auth?: ConfigAuth;
  cache?: ConfigCache;
  copyright?: string;
  debug?: boolean;
  desc?: string;
  headers?: ConfigGlobalParamItem[];
  parameters?: ConfigGlobalParamItem[];
  responses?: ConfigGlobalParamItem[];
  title?: string;
}

/**
 * 配置apps内容
 */
export interface ConfigAppItem {
  folder: string;
  groups?: ConfigAppGroupItem[];
  path: string;
  title: string;
  hasPassword?: boolean;
}

/**
 * 配置应用分组内容
 */
interface ConfigAppGroupItem {
  title: string;
  name: string;
  children?: ConfigAppGroupItem[];
}

/**
 * 配置权限设置
 */
interface ConfigAuth {
  enable: boolean;
}

/**
 * 配置缓存设置
 */
interface ConfigCache {
  enable: boolean;
  reload: boolean;
}

/**
 * 配置全局的headers、parameters、responses参数内容
 */
export interface ConfigGlobalParamItem {
  name: string;
  type: string;
  require: boolean;
  desc: string;
  value?: string;
}