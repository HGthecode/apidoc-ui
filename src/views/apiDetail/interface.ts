import { ApiItem } from "@/api/interface/apiData";

// export interface ApiParamState {
//   childrenType?: string;
//   default?: string | number | boolean;
//   desc?: string;
//   name: string;
//   replaceGlobal?: boolean;
//   require?: boolean;
//   source?: string;
//   type?: string;
// }

export interface ApiDetailState extends ApiItem {
  // header: ParamItem[];
  // param: ParamItem[];
  // return: ParamItem[];
  paramType?: string;
}

export interface UploadFileState {
  name: string;
}

export interface FileData {
  [key: string]: any;
}
