<template>
  <div class="app-select">
    <a-select
      :value="appKey"
      class="app-select_select"
      option-label-prop="label"
      :disabled="disabled"
      @change="onChange"
    >
      <template v-for="(item, index) in appList">
        <template v-if="item.items && item.items.length">
          <a-select-opt-group :label="item.title" :key="index">
            <a-select-option
              v-for="option in item.items"
              :key="`${item.folder},${option.folder}`"
              :value="`${item.folder},${option.folder}`"
              :label="`${item.title}-${option.title}`"
            >
              {{ option.title }}
              <span v-if="option.hasPassword && showLock" class="app-select-option_icon"
                ><LockOutlined
              /></span>
            </a-select-option>
          </a-select-opt-group>
        </template>
        <template v-else>
          <a-select-option :value="`${item.folder}`" :label="`${item.title}`" :key="`${index}`">
            {{ item.title }}
            <span v-if="item.hasPassword && showLock" class="app-select-option_icon"
              ><LockOutlined
            /></span>
          </a-select-option>
        </template>
      </template>
    </a-select>
  </div>
</template>

<script lang="ts">
import { Select } from "ant-design-vue";
import { reactive, defineComponent, toRefs, computed, PropType, watch } from "vue";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import * as Types from "@/store/modules/App/types";
import { LockOutlined } from "@ant-design/icons-vue";
import { ConfigAppItem } from "@/api/interface/config";

export default defineComponent({
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
    LockOutlined,
  },
  props: {
    showLock: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: true,
    },
    value: String,
    options: {
      type: Array as PropType<ConfigAppItem[]>,
      default: () => {
        return [];
      },
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  setup(props, { attrs }) {
    let store = useStore<GlobalState>();
    const state = reactive({
      appKey: props.value,
      appList: computed(() => {
        if (props.options && props.options.length) {
          return props.options;
        }
        const config = store.state.app.config;
        return config.apps;
      }),
    });

    watch(
      () => props.value,
      (v) => {
        state.appKey = v;
      }
    );

    const onChange = (appKey: string) => {
      if (attrs.onChange) {
        const changeFun: any = attrs.onChange;
        changeFun(appKey);
      } else {
        store.dispatch(`app/${Types.SET_APP_KEY}`, appKey);
      }
    };

    return { ...toRefs(state), onChange };
  },
});
</script>
<style lang="less" scoped>
.app-select {
  display: inline-block;
  &_select {
    width: 140px;
  }
  &-option_icon {
    position: absolute;
    right: 10px;
    color: var(--text-light-grey);
  }
}
</style>
