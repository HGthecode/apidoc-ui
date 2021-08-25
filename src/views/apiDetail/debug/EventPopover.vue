<template>
  <Popover v-if="eventData.list.length" placement="bottom">
    <template #content>
      <div class="event-list" v-for="(eventItem, eindex) in eventData.list" :key="eindex">
        <Badge :status="eventItem.status" :text="`${eventItem.title} ${eventItem.desc}`" />
      </div>
    </template>
    <template #title>
      <span>{{ title }}</span>
    </template>
    <Tag :color="eventData.status">
      <template #icon>
        <check-circle-outlined v-if="eventData.status === 'success'" />
        <close-circle-outlined v-else />
      </template>
      {{ title }} {{ eventData.list.length }}
    </Tag>
  </Popover>
</template>

<script lang="ts">
import { PropType } from "vue";
import { defineComponent } from "vue";
import { ResultState } from "./handleEvent";
import { Tag, Popover, Badge } from "ant-design-vue";
import { ReloadOutlined, CloseCircleOutlined, CheckCircleOutlined } from "@ant-design/icons-vue";

export default defineComponent({
  name: "Title",
  components: {
    Popover,
    Badge,
    Tag,
    CloseCircleOutlined,
    CheckCircleOutlined,
  },
  props: {
    title: {
      type: String as PropType<string>,
      default: "",
    },
    eventData: {
      type: Object as PropType<ResultState>,
      default: () => {
        return {
          status: "success",
          list: [],
        };
      },
    },
  },
});
</script>
<style lang="less" scoped>
.event-list {
  width: 300px;
  word-break: break-all;
}
</style>
