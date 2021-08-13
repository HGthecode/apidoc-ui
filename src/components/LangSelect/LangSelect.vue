<template>
  <div v-if="langList && langList.length > 1" class="lang-select">
    <a-select
      v-model:value="currentLang"
      :class="['lang-select_select', { mobile: isMobile }]"
      option-label-prop="label"
      @select="onChange"
    >
      <a-select-option
        v-for="item in langList"
        :key="item.lang"
        :value="`${item.lang}`"
        :label="`${item.title}`"
        >{{ item.title }}</a-select-option
      >
    </a-select>
  </div>
</template>

<script lang="ts">
import { Select, Modal } from "ant-design-vue";
import { reactive, defineComponent, toRefs, computed } from "vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import Cache from "@/utils/cache";
import { useI18n } from "@/hooks/useI18n";

export default defineComponent({
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
  },
  setup() {
    const { t } = useI18n();
    let store = useStore<GlobalState>();
    const state = reactive({
      count: 0,
      config: computed(() => store.state.app.config),
      feConfig: computed(() => store.state.app.feConfig),
      currentLang: "",
      isMobile: computed(() => store.state.app.isMobile),
    });
    const langList = computed(() => {
      if (state.feConfig.LANG && state.feConfig.LANG.length) {
        return state.feConfig.LANG;
      }
      return [];
    });
    const cacheLang = Cache.get("LANG");
    state.currentLang = cacheLang ? cacheLang : "zh-cn";

    const onChange = (currentLang: string) => {
      if (cacheLang === currentLang) {
        return false;
      }
      const find = langList.value.find((p) => p.lang === currentLang);
      const langTitle = find && find.title ? find.title : "";

      Modal.confirm({
        title: t("lang.change.confirm.title", { langTitle }),
        content: t("lang.change.confirm.content"),
        okText: t("common.ok"),
        cancelText: t("common.cancel"),
        onOk() {
          Cache.set("LANG", currentLang);
          window.location.href = "/";
        },
        onCancel() {
          state.currentLang = cacheLang;
        },
      });
    };

    return { ...toRefs(state), onChange, langList };
  },
});
</script>
<style lang="less" scoped>
.lang-select {
  display: inline-block;
  &_select {
    width: 100px;
    &.mobile {
      width: 86px;
    }
  }
}
</style>
