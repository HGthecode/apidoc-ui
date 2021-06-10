
export interface HttpResponse {
  status: number
  statusText: string
  data: {
    code: number
    desc: string
    [key: string]: any
  }
}


export interface GetApiDataState {
  appKey?:String
}

export interface ApidocState {
  docs: DocsItem[],
  groups: GroupItem[],
  list: ApiItem[],
  tags:String[]
}


export interface DocsItem {
  menu_key:String,
  path:String,
  title:String,
  type:String,

}

export interface GroupItem {
  title:String,
  name:String,
}

export interface ApiItem {
  title?:String,
  sort:Number,
  menu_key:String,
  group:String,
  controller?:String,
  children:ApiItem[],

}