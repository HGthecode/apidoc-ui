import store from "@/store";
import Cache from "../cache";
import * as Types from "@/store/modules/App/types";
import { onBeforeRouteUpdate, RouteLocationNormalized } from "vue-router";

// import OnNProgress from "./onNProgress";

export function getCacheToStore(): void {
  const theme = Cache.get(Types.APP_THEME) || "light";
  store.dispatch(`app/${Types.SET_APP_THEME}`, theme);
}

export function onNProgress(): void {
  console.log("onNProgress");
  onBeforeRouteUpdate((to: RouteLocationNormalized) => {
    console.log("onRoute", to);
  });
}
