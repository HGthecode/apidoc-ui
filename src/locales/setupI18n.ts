import type { App } from "vue";
import type { I18n, I18nOptions } from "vue-i18n";
import { createI18n } from "vue-i18n";
import Cache from "@/utils/cache";

export let i18n: ReturnType<typeof createI18n>;

async function createI18nOptions(): Promise<I18nOptions> {
  const cacheLang = Cache.get("LANG");
  const locale = cacheLang ? cacheLang : "zh-cn";
  // const defaultLocal = await import(`./lang/${locale}.ts`);
  // const message = defaultLocal.default ?? {};
  let message = {};
  if (localStorage.APIDOC_CONFIG) {
    const apidocConfig = JSON.parse(localStorage.APIDOC_CONFIG);
    if (apidocConfig.LANG) {
      const lanOption = apidocConfig.LANG.find((p: any) => p.lang === locale);
      if (lanOption) {
        message = lanOption.messages;
      }
    }
  }

  return {
    legacy: false,
    locale,
    messages: {
      [locale]: message,
    },
    sync: true, //If you don’t want to inherit locale from global scope, you need to set sync of i18n component option to false.
    silentTranslationWarn: true, // true - warning off
    missingWarn: false,
    silentFallbackWarn: true,
  };
}

// setup i18n instance with glob
export async function setupI18n(app: App) {
  const options = await createI18nOptions();
  i18n = createI18n(options) as I18n;
  app.use(i18n);
}
