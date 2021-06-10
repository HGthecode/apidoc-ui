
// import axios from 'axios';
import Axios from '@/utils/http/index'

// 获取配置信息
export const getConfigInfo = <T>() => Axios(`/apidoc/config`);


