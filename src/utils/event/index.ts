import Cache from "@/utils/cache";
import { GLOBAL_PARAMS } from "@/store/modules/Apidoc/types";
import * as Types from "@/store/modules/Apidoc/types";
import { Store } from "vuex";

export const setGolbalParam = (
  store: Store<any>,
  type: "headers" | "params",
  key: string,
  value?: string,
  desc?: string,
  appKey?: string
): void => {
  const globalParams = Cache.get(GLOBAL_PARAMS);
  if (globalParams && globalParams[type] && globalParams[type].length) {
    const findIndex = globalParams[type].findIndex((p: any) => p.name === key);
    if (findIndex > -1) {
      globalParams[type][findIndex].value = value;
    } else {
      globalParams[type].push({
        name: key,
        value,
        desc,
        appKey,
      });
    }
  } else {
    globalParams[type] = [
      {
        name: key,
        value,
        desc,
        appKey,
      },
    ];
  }

  store.dispatch(`apidoc/${Types.SET_GLOBAL_PARAMS}`, globalParams);
};

export const removeGolbalParam = (
  store: Store<any>,
  type: "header" | "params",
  key: string
): void => {
  const globalParams = Cache.get(GLOBAL_PARAMS);
  if (globalParams && globalParams[type] && globalParams[type].length) {
    globalParams[type] = globalParams[type].filter((p: any) => p.name !== key);
  }
  store.dispatch(`apidoc/${Types.SET_GLOBAL_PARAMS}`, globalParams);
};
