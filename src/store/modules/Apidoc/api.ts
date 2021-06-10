
// import axios from 'axios';
import Axios from '@/utils/http/index'
import { GetApiDataState,HttpResponse } from './interface';


export const getApiData = (params: GetApiDataState): Promise<HttpResponse>=>{
    return Axios('/apidoc/apiData', {
      method: 'get',
      params: {
        ...params
      },
    })
  }