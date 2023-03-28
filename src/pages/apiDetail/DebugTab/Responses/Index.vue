<template>
  <div>
    <a-tabs
      v-model:visible="state.activeTab"
      type="card"
      size="small"
      :class="[appStore.device]"
      @change="onTabChange"
    >
      <a-tab-pane key="responses" :tab="t('apiPage.responses')">
        <div v-if="state.responsesHtml || state.responsesCode" class="api-param-code">
          <div v-if="state.responsesHtml" class="string-code" v-html="state.responsesHtml"></div>
          <code-editor
            v-if="state.showCodeEditor && state.responsesCode"
            :code="state.responsesCode"
            :readOnly="true"
            :title="t('apiPage.responses')"
            height="300px"
            :hoverTipsParams="state.responsesTipsParams"
          />
        </div>
        <div v-else class="api-param-empty">
          <a-empty :description="false" />
        </div>
      </a-tab-pane>
      <a-tab-pane v-if="props.detail.before" key="eventBefore">
        <template #tab>
          {{ t('debug.event.before') }}
          <number-badge
            :count="props.detail.before.length"
            :type="
              result.beforeEvents && result.beforeEvents.status
                ? result.beforeEvents.status
                : 'default'
            "
          />
        </template>
        <EventTab :eventList="state.events.before" />
      </a-tab-pane>
      <a-tab-pane key="eventAfter">
        <template #tab>
          {{ t('debug.event.after') }}
          <number-badge
            :count="props.detail.after?.length"
            :type="
              result.afterEvents && result.afterEvents.status
                ? result.afterEvents.status
                : 'default'
            "
          />
        </template>
        <EventTab :eventList="state.events.after" />
      </a-tab-pane>

      <template #rightExtra>
        <result-status :result="props.result" :resultStatus="state.resultStatus" />
      </template>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
  import { formatJsonCode } from '/@/utils/helper/codeHelper'
  import CodeEditor from '/@/components/CodeEditor'
  import { ApiDetailResult, ApiDetailEventItem } from '/@/api/apidocApi/types'
  import { useI18n } from '/@/hooks/useI18n'
  import EventTab from './EventTab.vue'
  import NumberBadge from '/@/components/NumberBadge'
  import { useAppStore } from '/@/store'
  import ResultStatus from './ResultStatus.vue'
  import { ObjectType } from '/#/index'
  import { IMarkdownString } from 'monaco-editor'
  import { handleHoverTipsParams } from '/@/utils/helper/codeHelper'

  const appStore = useAppStore()

  const { t } = useI18n()

  const props = withDefaults(
    defineProps<{
      detail: ApiDetailResult
      result: any
    }>(),
    {},
  )

  interface Events {
    before: ApiDetailEventItem[]
    after: ApiDetailEventItem[]
  }
  const state = reactive<{
    events: Events
    activeTab: 'responses' | 'eventBefore' | 'eventAfter'
    responsesCode: string
    responsesHtml: string
    showCodeEditor: boolean
    resultStatus: 'success' | 'error' | 'info'
    responsesTipsParams: ObjectType<IMarkdownString[]>
  }>({
    events: {
      before: [],
      after: [],
    },
    activeTab: 'responses',
    responsesCode: '',
    responsesHtml: '',
    showCodeEditor: true,
    resultStatus: 'info',
    responsesTipsParams: {},
  })

  if (props.detail.before) {
    state.events.before = props.detail.before as ApiDetailEventItem[]
  }
  if (props.detail.after) {
    state.events.after = props.detail.after as ApiDetailEventItem[]
  }

  watchEffect(() => {
    if (props.detail.responseSuccess) {
      state.responsesTipsParams = handleHoverTipsParams(props.detail.responseSuccess)
    }
  })

  const onTabChange = (key) => {
    if (key === 'responses') {
      state.showCodeEditor = false
      setTimeout(() => {
        state.showCodeEditor = true
      }, 10)
    }
  }

  watchEffect(() => {
    const result = props.result
    if (result.beforeEvents && result.beforeEvents.list && result.beforeEvents.list.length) {
      state.events.before = result.beforeEvents.list
    }
    if (result.afterEvents && result.afterEvents.list && result.afterEvents.list.length) {
      state.events.after = result.afterEvents.list
    }
    if (result.data) {
      if (appStore.feConfig.CUSTOM_METHODS?.RESPONSES_VIEW) {
        const responsesContent = appStore.feConfig.CUSTOM_METHODS.RESPONSES_VIEW({
          detail: props.detail,
          result: props.result,
        })
        if (typeof responsesContent === 'string') {
          state.responsesHtml = responsesContent
          state.responsesCode = ''
        } else {
          if (responsesContent.html) {
            state.responsesHtml = responsesContent.html
          }
          if (responsesContent.code) {
            if (typeof responsesContent.code == 'string') {
              state.responsesHtml += responsesContent.code
            } else {
              state.responsesCode = formatJsonCode(responsesContent.code)
            }
          }
        }
      } else {
        if (typeof result.data === 'string') {
          state.responsesHtml = result.data
          state.responsesCode = ''
        } else {
          state.responsesHtml = ''
          state.responsesCode = formatJsonCode(result.data)
        }
      }
    }
    if (!result.status && !result.response) {
      state.resultStatus = 'info'
    } else if (result.status >= 200 && result.status < 300) {
      state.resultStatus = 'success'
    } else {
      state.resultStatus = 'error'
      if (result.response && result.response.data) {
        state.responsesCode = formatJsonCode(result.response.data)
      } else {
        state.responsesCode = formatJsonCode(result)
      }
    }
  })
</script>

<style lang="less" scoped>
  .api-param-empty {
    border: 1px solid @input-border-color;
    border-radius: 4px;
    padding: 16px;
  }

  &:deep(.ant-tabs.mobile) {
    & > .ant-tabs-nav {
      display: block;
    }
    .ant-tabs-extra-content {
      margin-top: 10px;
    }
  }
</style>
