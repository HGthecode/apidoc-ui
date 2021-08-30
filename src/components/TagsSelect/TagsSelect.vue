<template>
  <div v-if="tags.length" class="tags-select">
    <a-popover placement="bottom" overlayClassName="tags-select_popover">
      <template #content>
        <div class="tags-select_list select-menu">
          <ul>
            <li
              v-for="(tag, index) in tags"
              :key="index"
              :class="{ active: selectTags.includes(tag) }"
              @click="onSelectTag(tag)"
            >
              {{ tag }}
              <span class="tags-select_check">
                <CheckOutlined />
              </span>
            </li>
          </ul>
        </div>
      </template>
      <a-badge v-if="selectTags.length > 0" :count="selectTags.length">
        <a-button
          ><template #icon><TagsOutlined /></template
        ></a-button>
      </a-badge>
      <a-button v-else
        ><template #icon><TagsOutlined /></template
      ></a-button>
    </a-popover>
  </div>
</template>

<script lang="ts">
import { Popover, Button, Badge } from "ant-design-vue";
import { reactive, defineComponent, toRefs, computed } from "vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import { TagsOutlined, CheckOutlined } from "@ant-design/icons-vue";

export default defineComponent({
  components: {
    [Popover.name]: Popover,
    [Button.name]: Button,
    [Badge.name]: Badge,
    TagsOutlined,
    CheckOutlined,
  },
  emits: ["change"],
  setup(props, { emit }) {
    let store = useStore<GlobalState>();
    const tags: string[] = [];
    const state = reactive({
      count: 0,
      tags: computed(() => store.state.apidoc.tags),
      feConfig: computed(() => store.state.app.feConfig),
      selectTags: tags,
    });

    const onSelectTag = (tag: string) => {
      if (state.selectTags.includes(tag)) {
        state.selectTags = state.selectTags.filter((item) => item !== tag);
      } else {
        state.selectTags = [...state.selectTags, tag];
      }
      emit("change", state.selectTags);
    };

    return { ...toRefs(state), onSelectTag };
  },
});
</script>
<style lang="less" scoped>
.tags-select {
  &:deep(.ant-badge-count) {
    top: 5px;
    right: 5px;
    height: 16px;
    line-height: 16px;
    font-size: 12px;
  }
  &_list {
    width: 180px;
  }
}
</style>
