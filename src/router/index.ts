import { createRouter, RouteRecordRaw, createWebHashHistory } from "vue-router";
import BasicLayout from "../layouts/index.vue";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "index",
    component: BasicLayout,
    meta: {},
    redirect: "/home",
    children: [
      {
        path: "/home",
        name: "Home",
        component: () => import(/* webpackChunkName: "home" */ "../views/home/index.vue"),
        meta: {
          keepKey: "home",
          affix: true,
        },
      },

      {
        path: "/api",
        name: "ApiDetail",
        component: () => import(/* webpackChunkName: "apiDetail" */ "../views/apiDetail/index.vue"),
        meta: {},
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
