<template>
  <div>
    <div> home </div>
    <p>{{ t("home.title") }}</p>
    <input />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { formatJsonCode } from "@/utils/helper/codeHelper";
import { useI18n } from "@/hooks/useI18n";

export default defineComponent({
  name: "home",
  setup() {
    const { t } = useI18n();
    // const data = Mock.mock("number|1-10");
    // console.log(data);
    // console.log("load");
    // const json = {
    //   a: 123,
    //   b: "abc",
    //   name: "啦啦啦",
    //   "code-a": "code123456",
    //   children: [
    //     {
    //       name: "张三",
    //       age: 18,
    //     },
    //     {
    //       name: "李四",
    //       age: 21,
    //     },
    //   ],
    // };
    // const jsonString = formatJsonCode(json);
    // console.log(jsonString);
    // console.log("----------------");
    return { t };
  },
});
</script>
