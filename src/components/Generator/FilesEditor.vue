<template>
  <div class="file-list">
    <template v-for="(item, index) in fileDatas" :key="index">
      <div v-if="item.path.indexOf('.php') < 0" :key="index" class="file-item">
        <label>{{ item.name }}</label>
        <a-input
          v-model:value="item.value"
          class="input-link"
          :placeholder="`${t('common.please.input')} ${item.name}${t('common.file.name')}`"
          @blur="onInputBlur($event, index)"
        ></a-input>
        <div class="error-text" v-if="ruleError[item.name]">{{ ruleError[item.name] }}</div>
        <div
          ><label>Path：</label><span>{{ item.path }}</span></div
        >
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, watchEffect, computed, PropType, toRefs } from "vue";
import { Input } from "ant-design-vue";
import { useI18n } from "@/hooks/useI18n";
import { replaceAppConfigKeys } from "@/utils/index";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import { ConfigAppItem, ConfigGeneratorItemFilesItem } from "@/api/interface/config";
import { checkRules } from "@/utils/index";

declare type ObjectType = {
  [key: string]: any;
};

export default defineComponent({
  components: {
    [Input.name]: Input,
  },
  props: {
    appKey: {
      type: String,
      default: "",
    },
    files: {
      type: Array as PropType<ConfigGeneratorItemFilesItem[]>,
      default: () => {
        return [];
      },
    },
  },
  setup(props) {
    const { t } = useI18n();
    const store = useStore<GlobalState>();
    const ruleError: ObjectType = {};
    const fileDatas: ObjectType[] = [];
    const state = reactive({
      config: computed(() => store.state.app.config),
      fileDatas: fileDatas,
      ruleError: ruleError,
    });
    watchEffect(() => {
      let data: any = [];
      if (props.files && props.files.length) {
        for (let i = 0; i < props.files.length; i++) {
          const item: ConfigGeneratorItemFilesItem = props.files[i];
          data.push({
            name: item.name,
            value: "",
            path: replaceAppConfigKeys(
              state.config.apps as ConfigAppItem[],
              props.appKey,
              item.path
            ),
          });
        }
      }
      state.fileDatas = data;
    });

    function onInputBlur(e: any, index: number) {
      const { value } = e.target;
      if (index === 0) {
        state.fileDatas = state.fileDatas.map((p: ObjectType) => {
          p.value = value;
          return p;
        });
      }

      const item: ConfigGeneratorItemFilesItem = props.files[index];
      const errorMessage = checkRules(value, item.rules);
      if (errorMessage) {
        state.ruleError[item.name as string] = errorMessage;
      } else {
        delete state.ruleError[item.name as string];
      }
    }

    function getData() {
      const data: any = state.fileDatas;
      // 验证
      let error: any = {};
      for (let i = 0; i < props.files.length; i++) {
        const item = props.files[i];
        if (item.rules && item.rules.length) {
          const value = data[i].value;
          const errorMessage = checkRules(value, item.rules);
          if (errorMessage) {
            error[item.name] = errorMessage;
          }
        }
      }
      state.ruleError = error;
      if (!(JSON.stringify(error) == "{}")) {
        return false;
      }

      return state.fileDatas;
    }
    return {
      ...toRefs(state),
      t,
      getData,
      onInputBlur,
    };
  },
});
</script>
<style lang="less" scoped>
.file-list {
  display: flex;
  overflow-x: auto;
  margin-bottom: 10px;
  .file-item {
    label {
      color: rgb(153, 153, 153);
    }
    background: var(--bgcolor-grey);
    padding: 10px;
    flex: 1;
    margin: 0 3px;
    min-width: 220px;
    min-height: 100px;
    .input-link {
      border: none;
      border-bottom: 1px solid #ddd;
      background: none;
      font-size: 16px;
      font-weight: 500;
      &:focus {
        box-shadow: none;
      }
    }
    .error-text {
      color: red;
    }
  }
}
</style>
