import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
// import * as Types from "@/store/modules/App/types";

// import hljs from 'highlight.js'
// import 'highlight.js/styles/vs.css'
// import "highlight.js/styles/atom-one-dark.css";
const app = createApp(App);

// store.dispatch(`app/${Types.GET_FE_CONFIG}`)

// 注册代码高亮指令
// app.directive('highlight', {
//     beforeMount(el, binding){
//         const targets = el.querySelectorAll('code')
//         const arg = binding.arg?binding.arg:"json"
//         targets.forEach((target:HTMLElement) => {
//             if (typeof binding.value === 'string') {
//                 target.textContent = binding.value
//             }
//             target.classList.add(`language-${arg}`)
//             hljs.highlightBlock(target)
//         })
//     },
//     updated(el, binding){
//         const targets = el.querySelectorAll('code')
//         const arg = binding.arg?binding.arg:"json"
//         targets.forEach((target:HTMLElement) => {
//             if (typeof binding.value === 'string') {
//                 target.textContent = binding.value
//                 target.classList.add(`language-${arg}`)
//                 hljs.highlightBlock(target)
//             }
//         })
//     }
// })


// app.use(hljs.vuePlugin);

app.use(store);

app.use(router);


app.mount('#app');

