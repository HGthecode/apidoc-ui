

export interface AppState {
  title:string,
  config: ConfigState,
  feConfig:FeConfigState
}

export interface FeConfigState {
  HOST?:string
}

export interface ConfigState {
  title?:string
}

export interface GetConfigState {
  appKey?:string
}

export interface GetApiDataState {
  appKey:string
}