export interface HttpResponse {
  status: number;
  statusText: string;
  data: {
    code: number;
    desc: string;
    data: any;
    [key: string]: any;
  };
}

export interface GetApiDataState {
  appKey?: string;
}

export interface GetMdMenusState {
  appKey?: string;
}

export interface GetMdDetailState {
  appKey: string;
  path: string;
}
