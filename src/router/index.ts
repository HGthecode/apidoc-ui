import {
  createRouter,
  createWebHistory,
  RouteRecordRaw,
  createWebHashHistory,
  onBeforeRouteUpdate,
  RouteLocationNormalizedLoaded,
} from "vue-router";
import BasicLayout from "../layouts/index.vue";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "index",
    component: BasicLayout,
    meta: {
      // title: "首页",
    },
    redirect: "/home",
    children: [
      {
        path: "/home",
        name: "Home",
        component: () => import(/* webpackChunkName: "home" */ "../views/home/index.vue"),
        meta: {
          keepKey: "home",
          affix: true,
          title: "首页",
        },
      },

      {
        path: "/api",
        name: "ApiDetail",
        component: () => import(/* webpackChunkName: "apiDetail" */ "../views/apiDetail/index.vue"),
        meta: {
          // keepKey: ($route: RouteLocationNormalizedLoaded): string => {
          //   return $route.fullPath;
          // },
        },
      },
      {
        path: "/md",
        name: "MdDetail",
        component: () => import(/* webpackChunkName: "mdDetail" */ "../views/mdDetail/index.vue"),
      },
    ],
  },
];

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: createWebHashHistory(),
  routes,
});

export default router;
