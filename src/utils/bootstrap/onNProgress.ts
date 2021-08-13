import { onBeforeRouteUpdate, RouteLocationNormalized } from "vue-router";

export default function (): void {
  onBeforeRouteUpdate((to: RouteLocationNormalized) => {
    console.log("onRoute", to);
  });
}
