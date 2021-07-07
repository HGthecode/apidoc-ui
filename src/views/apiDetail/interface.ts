import { ApiItem } from "@/store/modules/Apidoc/interface";

export interface ApiParamState {
  childrenType?: string;
  default?: string | number | boolean;
  desc?: string;
  name: string;
  replaceGlobal?: boolean;
  require?: boolean;
  source?: string;
  type?: string;
}

export interface ApiDetailState extends ApiItem {
  header: ApiParamState[];
  param: ApiParamState[];
  return: ApiParamState[];
  paramType?: string;
}

export interface UploadFileState {
  name: string;
}

export interface FileData {
  [key: string]: any;
}
