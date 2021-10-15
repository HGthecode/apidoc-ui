import { createStorage, CreateStorageParams } from "./webStorage";

const createOptions = (storage: Storage): CreateStorageParams => {
  let prefixKey = "";
  if (localStorage.APIDOC_CONFIG) {
    const feConfig = JSON.parse(localStorage.APIDOC_CONFIG);
    if (feConfig && feConfig.CACHE && feConfig.CACHE.PREFIX) {
      prefixKey = feConfig.CACHE.PREFIX;
    }
  }
  return {
    storage,
    prefixKey: prefixKey,
  };
};

export const WebStorage = createStorage(createOptions(localStorage));
export default WebStorage;
