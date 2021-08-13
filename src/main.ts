import "@/styles/index.less";
import { createApp } from "vue";
import App from "./App.vue";
import { getCacheToStore } from "@/utils/bootstrap";
// import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import * as Types from "@/store/modules/App/types";
import { registerHighlight } from "@/directives/highlight";

import { setupI18n } from "@/locales/setupI18n";

async function bootstrap() {
  const app = createApp(App);

  store.dispatch(`app/${Types.GET_FE_CONFIG}`);

  getCacheToStore();

  registerHighlight(app);

  setupI18n(app);

  app.use(store);

  app.use(router);

  app.mount("#app");
}

void bootstrap();
