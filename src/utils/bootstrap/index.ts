import store from "@/store";
import Cache from "../cache";
import * as Types from "@/store/modules/App/types";

export function getCacheToStore(): void {
  const theme = Cache.get(Types.APP_THEME) || "light";
  store.dispatch(`app/${Types.SET_APP_THEME}`, theme);
}
