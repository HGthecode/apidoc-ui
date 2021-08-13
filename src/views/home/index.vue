<template>
  <div class="home-page">
    <div class="home-page-content">
      <div class="readme">
        <h1>{{ config.title }}</h1>
        <p>{{ config.desc }}</p>
      </div>
      <a-row :gutter="16">
        <a-col :span="8">
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
        <a-col :span="8">
          <a-card :bodyStyle="{ textAlign: 'center', padding: '5px' }">
            <template #title> {{ t("common.type") }} </template>
            <div
              ref="methodChart"
              :style="{ width: '172px', height: '172px', margin: '0 auto' }"
            ></div>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card>
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
        <a-col :span="8">
          <a-card>
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
        <a-col :span="16">
          <a-card :bodyStyle="{ padding: '10px' }">
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
import * as echarts from "echarts";
import { ConfigAppGroupItem } from "@/api/interface/config";

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
    const methodChartOptions = ref<any>();

    const state = reactive({
      apiAnalysis: computed(() => store.state.apidoc.apiAnalysis),
      currentApp: computed(() => store.state.apidoc.currentApp),
      config: computed(() => store.state.app.config),
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
    });

    function renderMethodChart() {
      // 绘制图表
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      methodChartOptions.value = echarts.init(methodChart.value!);
      const options: any = {
        tooltip: {
          trigger: "item",
        },
        legend: {
          show: false,
          orient: "vertical",
          left: "right",
        },
        series: [
          {
            name: "请求类型",
            type: "pie",
            radius: ["50%", "90%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: "20",
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            data: [],
          },
        ],
      };
      options.series[0].data = Object.keys(state.apiAnalysis.apiMethodTotal).map((key) => {
        let color = "#87d068";
        switch (key) {
          case "GET":
            color = "#87d068";
            break;
          case "POST":
            color = "#2db7f5";
            break;
          case "PUT":
            color = "#ff9800";
            break;
          case "DELETE":
            color = "#ff4d4f";
            break;
        }
        return {
          name: key,
          value: state.apiAnalysis.apiMethodTotal[key],
          itemStyle: {
            color: color,
          },
        };
      });

      methodChartOptions.value.setOption(options);
    }

    onMounted(() => {
      if (
        state.apiAnalysis.apiMethodTotal &&
        Object.keys(state.apiAnalysis.apiMethodTotal).length
      ) {
        renderMethodChart();
      }
      if (state.apiAnalysis.apiGroupTotal && Object.keys(state.apiAnalysis.apiGroupTotal).length) {
        state.groupData = renderGroupData();
      }
    });
    watch(
      () => state.apiAnalysis.apiMethodTotal,
      () => {
        renderMethodChart();
      }
    );

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
