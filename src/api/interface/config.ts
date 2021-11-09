import { FormItemType } from "@/components/DataForm/interface";

export interface GetConfigState {
  lang?: string;
}

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
  generator?: ConfigGeneratorItem[];
}

/**
 * 配置apps内容
 */
export interface ConfigAppItem {
  folder: string;
  groups?: ConfigAppGroupItem[];
  path?: string;
  title: string;
  hasPassword?: boolean;
  items?: ConfigAppItem[];
  headers?: ConfigGlobalParamItem[];
  parameters?: ConfigGlobalParamItem[];
  host?: string;
}

/**
 * 配置应用分组内容
 */
export interface ConfigAppGroupItem {
  title: string;
  name: string;
  label?: string;
  value?: string;
  key?: string;
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
  appKey?: string;
  appDisabled?: boolean;
}

export interface ConfigGeneratorItem {
  title: string;
  name: string;
  files: ConfigGeneratorItemFilesItem[];
  form?: ConfigGeneratorItemForm;
  table?: ConfigGeneratorItemTable;
}

export interface ConfigGeneratorItemForm {
  [key: string]: any;
  items: FormItemType[];
}

export interface ConfigGeneratorItemTable {
  field_types: any;
  items: ConfigGeneratorItemTableItem[];
}

export interface ConfigGeneratorItemTableItem {
  title: string;
  model_path: string;
  default_fields: any;
  namespace?: string;
  model_tpl?: string;
  columns?: ConfigGeneratorItemTableColumn[];
}

export interface ConfigGeneratorItemTableColumn {
  title: string;
  field: string;
  type: string;
  slots?: any;
  width?: number;
  align?: string;
}

export interface ConfigGeneratorItemFilesItem {
  name: string;
  path: string;
  namespace: string;
  template?: string;
  rules?: any;
}
