import {
  createRouter,
  createWebHistory,
  RouteRecordRaw,
  createWebHashHistory,
  onBeforeRouteUpdate,
  RouteLocationNormalizedLoaded,
} from "vue-router";
import BasicLayout from "../layouts/index.vue";

// 异步加载页面组件
const importPage = (view: string) => () =>
  import(/* webpackChunkName: "p-[request]" */ `../views/${view}/index.vue`);

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
        component: importPage("home"),
        meta: {
          keepKey: "home",
          affix: true,
          title: "首页",
        },
      },
      // {
      //   path: "/home1",
      //   name: "Home1",
      //   component: () => import(/* webpackChunkName: "home" */ "../views/home/index.vue"),
      //   meta: {
      //     affix: true,
      //     title: "首页1",
      //   },
      // },
      // {
      //   path: "/home3",
      //   name: "Home3",
      //   component: () => import(/* webpackChunkName: "home" */ "../views/home/index.vue"),
      //   meta: {
      //     affix: true,
      //     title: "首页3",
      //   },
      // },
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

// onBeforeRouteUpdate((to)=>{

// })

export default router;
