<template>
  <a-modal
    :visible="visible"
    :width="isMobile ? '90%' : 900"
    :destroyOnClose="true"
    :title="title"
    @cancel="onCancel"
  >
    <div>
      <markdown :md="md" />
    </div>
    <template #footer>
      <a-button @click="onCancel">{{ t("common.close") }}</a-button>
    </template>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { Modal, Input, Button } from "ant-design-vue";
import useModal from "@/hooks/useModal";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import Markdown from "./Markdown.vue";
import { getMdDetail } from "@/api";
import { useI18n } from "@/hooks/useI18n";
import Cache from "@/utils/cache";

export default defineComponent({
  components: {
    [Modal.name]: Modal,
    [Button.name]: Button,
    [Input.Password.name]: Input.Password,
    Markdown,
  },
  emits: ["check"],
  setup() {
    const { t } = useI18n();
    const store = useStore<GlobalState>();
    const { visible, onShow, onCancel } = useModal();
    const title = ref<string>("");
    const md = ref<string>("");
    const loading = ref<boolean>(false);
    const isMobile = computed(() => store.state.app.isMobile);
    const appKey = computed(() => store.state.app.appKey);
    const cacheLang = Cache.get("LANG");

    function show(text: string, modalTitle = "说明", mdRef = "") {
      title.value = modalTitle;
      loading.value = true;
      onShow();
      if (mdRef) {
        getMdDetail({
          appKey: appKey.value,
          path: mdRef,
          lang: cacheLang,
        }).then((res) => {
          md.value = res.data.data.content;
          loading.value = false;
        });
      } else {
        md.value = text;
      }
    }

    return {
      visible,
      onShow,
      onCancel,
      title,
      md,
      show,
      isMobile,
      t,
    };
  },
});
</script>
