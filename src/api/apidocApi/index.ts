import { post } from '/@/utils/http/axios'
import {
  ApiMenusParams,
  ApiMenusResult,
  DocMenusParams,
  DocMenusItem,
  ApiDetailParams,
  ApiDetailResult,
  DocDetailParams,
  DocDetailResult,
  GeneratorParams,
  GeneratorResult,
  VerifyAuthParams,
  VerifyAuthResult,
  CodeTemplateParams,
  CodeTemplateResult,
} from './types'

export enum URL {
  apiMenus = '/apidoc/apiMenus',
  apiDetail = '/apidoc/apiDetail',
  docMenus = '/apidoc/docMenus',
  docDetail = '/apidoc/docDetail',
  generator = '/apidoc/generator',
  verifyAuth = '/apidoc/verifyAuth',
  cancelAllCache = '/apidoc/cancelAllCache',
  createAllCache = '/apidoc/createAllCache',
  renderCodeTemplate = '/apidoc/renderCodeTemplate',
}

export default class globalApi {
  static getApiMenus = async (data: ApiMenusParams) =>
    post<ApiMenusResult>({ url: URL.apiMenus, data })

  static getApiDetail = async (data: ApiDetailParams) =>
    post<ApiDetailResult>({ url: URL.apiDetail, data })

  static getDocMenus = async (data: DocMenusParams) =>
    post<DocMenusItem[]>({ url: URL.docMenus, data })

  static getDocDetail = async (data: DocDetailParams) =>
    post<DocDetailResult>({ url: URL.docDetail, data })

  static generator = async (data: GeneratorParams) =>
    post<GeneratorResult>({ url: URL.generator, data })

  static verifyAuth = async (data: VerifyAuthParams) =>
    post<VerifyAuthResult>({ url: URL.verifyAuth, data })

  static cancelAllCache = async () => post({ url: URL.cancelAllCache })

  static createAllCache = async () => post({ url: URL.createAllCache })

  static renderCodeTemplate = async (data: CodeTemplateParams) =>
    post<CodeTemplateResult>({ url: URL.renderCodeTemplate, data })
}
