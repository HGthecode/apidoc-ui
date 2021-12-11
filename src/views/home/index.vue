<template>
  <div class="home-page">
    <div class="home-page-content">
      <div class="readme">
        <h1>{{ config.title }}</h1>
        <p>{{ config.desc }}</p>
      </div>
      <a-row :gutter="16">
        <a-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="number-block">
            <a-card-meta class="number-block-item">
              <template #avatar>
                <a-avatar class="color-orange" :size="50">APP</a-avatar>
              </template>
              <template #title>
                <div>{{ apiAnalysis.appCount }}</div>
              </template>
              <template #description>
                <div>{{ t("home.appCount") }}</div>
              </template>
            </a-card-meta>
            <a-card-meta class="number-block-item">
              <template #avatar>
                <a-avatar class="color-green" :size="50">API</a-avatar>
              </template>
              <template #title>
                <div>{{ apiAnalysis.apiCount }}</div>
              </template>
              <template #description>
                <div>{{ t("home.apiCount") }}</div>
              </template>
            </a-card-meta>
            <a-card-meta class="number-block-item">
              <template #avatar>
                <a-avatar class="color-blue" :size="50">DOCS</a-avatar>
              </template>
              <template #title>
                <div>{{ apiAnalysis.docsCount }}</div>
              </template>
              <template #description>
                <div>{{ t("home.docsCount") }}</div>
              </template>
            </a-card-meta>
          </div>
        </a-col>
        <a-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <a-card class="mb-sm" :bodyStyle="{ padding: '10px' }">
            <template #title> {{ t("common.type") }} </template>
            <div v-if="Object.keys(apiAnalysis.apiMethodTotal).length" class="method-list">
              <ul>
                <li v-for="(number, key) in apiAnalysis.apiMethodTotal" :key="key">
                  <div class="info">
                    <div class="name">{{ key }}</div>
                    <div class="value">{{ number }}</div>
                  </div>
                  <div
                    class="bg"
                    :style="{
                      backgroundColor:
                        feConfig.METHODCOLOR && feConfig.METHODCOLOR[key]
                          ? feConfig.METHODCOLOR[key]
                          : '',
                    }"
                  ></div>
                </li>
              </ul>
            </div>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <a-card class="mb-sm" :bodyStyle="{ padding: '10px' }">
            <template #title> {{ t("apiPage.tag") }} </template>
            <div v-if="Object.keys(apiAnalysis.apiTagTotal).length" class="tags-wraper">
              <a-tag v-for="(number, key) in apiAnalysis.apiTagTotal" :key="key"
                >{{ key }} {{ number }}</a-tag
              >
            </div>
            <div v-else>
              <a-empty :image="simpleImage" :description="t('common.notdata')" />
            </div>
          </a-card>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <a-card class="mb-sm">
            <template #title> {{ t("apiPage.author") }} </template>
            <div v-if="Object.keys(apiAnalysis.apiAuthorTotal).length" class="author-list">
              <ul>
                <li v-for="(number, key) in apiAnalysis.apiAuthorTotal" :key="key">
                  <h4>{{ key }}</h4>
                  <a-progress
                    :format="() => number"
                    :percent="parseInt((number / apiAnalysis.apiCount) * 100)"
                  />
                </li>
              </ul>
            </div>
            <div v-else>
              <a-empty :image="simpleImage" :description="t('common.notdata')" />
            </div>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
          <a-card class="mb-sm" :bodyStyle="{ padding: '10px' }">
            <template #title> {{ t("common.group") }} </template>
            <div>
              <a-table
                :columns="groupColumns"
                :pagination="false"
                size="small"
                :data-source="groupData"
                :locale="{ emptyText: t('common.notdata') }"
                rowKey="name"
              ></a-table>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, computed, toRefs, ref, onMounted, watch } from "vue";
import { useI18n } from "@/hooks/useI18n";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import { Card, Row, Col, Avatar, Progress, Tag, Table, Empty } from "ant-design-vue";
// import * as echarts from "echarts";
import { ConfigAppGroupItem } from "@/api/interface/config";
import { throttle } from "lodash";

export default defineComponent({
  name: "home",
  components: {
    [Card.name]: Card,
    [Card.Meta.name]: Card.Meta,
    [Row.name]: Row,
    [Col.name]: Col,
    [Avatar.name]: Avatar,
    [Progress.name]: Progress,
    [Tag.name]: Tag,
    [Table.name]: Table,
    AEmpty: Empty,
  },
  setup() {
    const { t } = useI18n();
    const store = useStore<GlobalState>();
    const methodChart = ref<HTMLElement>();
    // const methodChartOptions = ref<any>();

    const state = reactive({
      apiAnalysis: computed(() => store.state.apidoc.apiAnalysis),
      currentApp: computed(() => store.state.apidoc.currentApp),
      config: computed(() => store.state.app.config),
      feConfig: computed(() => store.state.app.feConfig),
      groupColumns: [
        {
          title: "名称",
          dataIndex: "title",
        },
        {
          title: "控制器",
          dataIndex: "controller",
        },
        {
          title: "接口",
          dataIndex: "api",
        },
      ],
      groupData: [],
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      theme: computed(() => store.state.app.theme),
    });

    onMounted(() => {
      if (state.apiAnalysis.apiGroupTotal && Object.keys(state.apiAnalysis.apiGroupTotal).length) {
        state.groupData = renderGroupData();
      }
    });

    function renderGroupData() {
      let data: any = [];
      function renderGroup(list: ConfigAppGroupItem[]) {
        return list.map((item) => {
          const groupItem: any = {
            ...item,
            controller: state.apiAnalysis.controllerGroupTotal[item.name],
            api: state.apiAnalysis.apiGroupTotal[item.name],
          };
          if (item.children && item.children.length) {
            groupItem.children = renderGroup(item.children);
          }
          return groupItem;
        });
      }
      if (state.currentApp.groups && state.currentApp.groups.length) {
        data = renderGroup(state.currentApp.groups);
      }
      return data;
    }
    watch(
      () => state.apiAnalysis.apiGroupTotal,
      () => {
        state.groupData = renderGroupData();
      }
    );

    return { ...toRefs(state), t, methodChart };
  },
});
</script>

<style lang="less" scoped>
@import "./home.less";
</style>
