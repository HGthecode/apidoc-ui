import {
  createRouter,
  createWebHistory,
  RouteRecordRaw,
  createWebHashHistory,
} from 'vue-router'
import BasicLayout from '../layouts/index.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: {
      title: '首页',
    },
    redirect: '/api',
    children: [
      {
        path: '/api',
        name: "ApiDetail",
        component: () =>
             import(
            /* webpackChunkName: "apiDetail" */ '../views/apiDetail/index.vue'
          ),
      },
      {
        path: '/md',
        name: 'MdDetail',
        component: () =>
          import(
            /* webpackChunkName: "mdDetail" */ '../views/mdDetail/index.vue'
          ),
      },
    ],
  },
]

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: createWebHashHistory(),
  routes,
})

export default router
