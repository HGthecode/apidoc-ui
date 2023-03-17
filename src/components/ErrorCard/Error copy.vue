<template>
  <div class="error-box">
    <div class="error-status">
      <div><WarningOutlined /></div>
      <div>{{ status }}</div>
    </div>
    <div>
      <p>Url: {{ error.config && error.config.baseURL }}{{ error.config && error.config.url }}</p>
    </div>
    <iframe v-if="errorIframeUrl" :src="errorIframeUrl" class="error-iframe"></iframe>
    <div v-else class="error-message">{{ message }}</div>
  </div>
</template>

<script lang="ts" setup>
  import { WarningOutlined } from '@ant-design/icons-vue'
  const props = withDefaults(
    defineProps<{
      error: any
    }>(),
    {},
  )

  const message = computed(() => {
    const error = props.error
    if (error.response && error.response.data && error.response.data.message) {
      return error.response.data.message
    } else if (error.data && (error.data.message || error.data.msg)) {
      return error.data.message ? error.data.message : error.data.msg
    }
    return error.message
  })
  const status = computed(() => {
    const error = props.error
    if (error.response && error.response.status) {
      return error.response.status
    } else if (error.data && error.data.code) {
      return error.data.code
    }
    return error.status ? error.status : 500
  })
  const errorIframeUrl = computed(() => {
    const error = props.error
    if (error.config && error.code == 'ERR_NETWORK') {
      let urlParams = ''
      if (error.config.method == 'post' && error.config.data) {
        const data = JSON.parse(error.config.data)
        for (const key in data) {
          const val = data[key]
          if (val) {
            const fh = urlParams ? '&' : '?'
            urlParams += `${fh}${key}=${val}`
          }
        }
      }
      let url = (error.config.baseURL as string) + error.config.url + urlParams

      return url
    }
    return ''
  })
</script>
<style lang="less" scoped>
  .error-box {
    padding: 50px 100px 0 50px;
    text-align: center;
    .error-status {
      font-size: 50px;
      color: @error-color;
    }
    .error-message {
      font-size: 16px;
      padding: 10px;
      background: #282c34;
      border-radius: 6px;
      color: #ddd;
      margin-bottom: 20px;
    }
    .error-iframe {
      width: 100%;
      height: calc(100vh - 300px);
      border: none;
    }
  }
</style>
