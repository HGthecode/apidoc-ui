<template>
  <div> home </div>
  <input />
  <!-- <router-link to="/home/1">home1</router-link>
  <router-link to="/home/2">home2</router-link>
  <router-link to="/home/3">home3</router-link> -->
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { transitionJsonToString, formatJson } from "@/utils/helper/codeHelper";

export default defineComponent({
  setup() {
    console.log("load");
    const json = {
      a: 123,
      b: "abc",
      name: "啦啦啦",
      "code-a": "code123456",
      children: [
        {
          name: "张三",
          age: 18,
        },
        {
          name: "李四",
          age: 21,
        },
      ],
    };

    const jsonString = formatJson(json, (e: any) => {
      console.log("error", e);
    });
    console.log(jsonString);
    console.log("----------------");
  },
});
</script>
