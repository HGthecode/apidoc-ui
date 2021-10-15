// import { ref, Ref } from "vue";
import Cache from "@/utils/cache";
import { GLOBAL_PARAMS } from "@/store/modules/Apidoc/types";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import * as Types from "@/store/modules/Apidoc/types";

interface Types {
  setGolbalHeader: (key: string, value: any, ...arg: any) => void;
}
export default (): Types => {
  function setGolbalHeader(key: string, value: any, ...arg: any): void {
    const store = useStore<GlobalState>();
    const globalParams = Cache.get(GLOBAL_PARAMS);
    if (globalParams && globalParams.header && globalParams.header.length) {
      const findIndex = globalParams.header.findIndex((p: any) => p.name === key);
      if (findIndex > -1) {
        globalParams.header[findIndex].value = value;
      } else {
        globalParams.header.push({
          name: key,
          value,
          ...arg,
        });
      }
    } else {
      globalParams.header = [
        {
          name: key,
          value,
          ...arg,
        },
      ];
    }
    store.dispatch(`apidoc/${Types.SET_GLOBAL_PARAMS}`, globalParams);
  }

  return {
    setGolbalHeader,
  };
};
