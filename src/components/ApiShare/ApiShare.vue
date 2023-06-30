<template>
  <div>
    <a-modal
      :visible="state.visible"
      :width="appStore.device == DeviceEnum.MOBILE ? '90%' : 900"
      :bodyStyle="{ padding: '0 10px 10px' }"
      :maskClosable="false"
      :title="state.modalTitle"
      destroyOnClose
      class="api-share-modal"
      @cancel="onCancel"
    >
      <div class="api-share-wraper">
        <div class="api-share-header">
          <a-button type="primary" @click="onAdd">+ {{ t(`apiShare.button.create`) }}</a-button>
        </div>
        <div v-if="state.shareList.length">
          <div class="api-share-list">
            <div class="api-share-item flex" v-for="item in state.shareList" :key="item.key">
              <div class="flex-item">
                <h4 class="mb-sm">{{ item.name }}</h4>
                <div class="api-share-item-desc">
                  <span>{{ t(`apiShare.type.label`) }}：{{ t(`apiShare.type.${item.type}`) }}</span>
                  <span>{{ t(`apiShare.time.label`) }}：{{ item.create_at }}</span>
                </div>
              </div>
              <div class="api-share-item-actions">
                <div class="mb-sm">
                  <a-button size="small" @click="onEdit(item)">{{
                    t(`apiShare.button.edit`)
                  }}</a-button
                  >&nbsp;&nbsp;
                  <a-popconfirm
                    :title="t(`common.delete.confirm.title`)"
                    :ok-text="t(`common.ok`)"
                    :cancel-text="t(`common.cancel`)"
                    @confirm="confirmDelete(item)"
                  >
                    <a-button size="small">{{ t(`apiShare.button.delete`) }}</a-button>
                  </a-popconfirm>
                </div>
                <div>
                  <a @click="onCopyLink(item)">{{ t(`common.copyUrl`) }}</a>
                  <a
                    v-for="(action, actionIndex) in appStore.serverConfig.share?.actions"
                    :key="actionIndex"
                    @click="onItemActionClick(item, actionIndex)"
                    >{{ action.name }}</a
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="api-share-pagination">
            <a-pagination
              v-model:current="state.pageIndex"
              :total="state.pageTotal"
              v-model:pageSize="state.pageSize"
              show-less-items
              @change="onPaginationChange"
            />
          </div>
        </div>
        <div v-else>
          <a-empty :description="t('common.notdata')" />
        </div>
      </div>
      <template #footer>
        <a-button @click="onCancel">{{ t('common.close') }}</a-button>
      </template>
    </a-modal>
    <EditShareModal ref="editShareModal" @reload="onReload" />
  </div>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue'
  import { useAppStore } from '/@/store/modules/app'
  import { useI18n } from '/@/hooks/useI18n'
  import apidocApi from '/@/api/apidocApi'
  import { DeviceEnum } from '/@/enums/appEnum'
  import EditShareModal from './EditShare.vue'
  import { message } from 'ant-design-vue'
  import { copyTextToClipboard } from '/@/utils/helper/index'

  const props = defineProps({
    onSuccess: {
      type: Function,
      default: () => {
        return
      },
    },
    onCancel: {
      type: Function,
      default: () => {
        return
      },
    },
  })
  const { t } = useI18n()
  const appStore = useAppStore()
  const editShareModal = ref()

  const state = reactive<{
    visible: boolean
    modalTitle: string
    loading: boolean
    shareList: any[]
    pageIndex: number
    pageTotal: number
    pageSize: number
  }>({
    visible: false,
    modalTitle: t('apiShare.title'),
    loading: false,
    shareList: [],
    pageIndex: 1,
    pageTotal: 0,
    pageSize: 5,
  })

  onMounted(() => {
    state.visible = true
  })

  const fetchApiShareList = () => {
    apidocApi
      .getApiShareList({
        pageIndex: state.pageIndex,
      })
      .then((res) => {
        state.shareList = res.data.data
        state.pageTotal = res.data.total
      })
  }
  fetchApiShareList()

  const onReload = () => {
    state.pageIndex = 1
    fetchApiShareList()
  }

  const onCancel = () => {
    state.visible = false
    props.onCancel && props.onCancel()
  }
  const onAdd = () => {
    editShareModal.value.onShow()
  }
  const confirmDelete = (item) => {
    apidocApi.deleteApiShare({ key: item.key }).then(() => {
      message.success(t('common.actionSuccess'))
      onReload()
    })
  }
  const onEdit = (item) => {
    editShareModal.value.onShow(item.key)
  }
  const onPaginationChange = (page) => {
    state.pageIndex = page
    fetchApiShareList()
  }
  const onCopyLink = (item) => {
    let url = window.location.href
    if (url.indexOf('#') > -1) {
      url = url.split('#')[0]
    }
    const link = url + '#home?shareKey=' + item.key
    copyTextToClipboard(link)
    message.success(t('common.copySuccess'))
  }
  const onItemActionClick = (item, index) => {
    apidocApi
      .handleApiShareAction({
        key: item.key,
        index,
      })
      .then((res) => {
        if (res.data) {
          eval(res.data)
        }
      })
  }
</script>

<style lang="less" scoped>
  .api-share-wraper {
    padding: 20px;
  }
  .api-share-header {
    margin-bottom: 10px;
  }
  .api-share-list {
    border-top: 1px solid @border-line-color;
    min-height: 386px;
    .api-share-item {
      border-bottom: 1px solid @border-line-color;
      padding: 10px 0;
      h4 {
        margin: 0;
        font-weight: bold;
      }
      .api-share-item-desc {
        color: @font-color-grey;
        & > span {
          margin-right: 30px;
        }
      }
      .api-share-item-actions {
        text-align: right;
        a {
          line-height: 22px;
          & + a {
            margin-left: 24px;
          }
        }
      }
    }
  }
  .api-share-pagination {
    margin-top: 10px;
    text-align: right;
  }
</style>
