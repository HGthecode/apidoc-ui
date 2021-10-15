import type { App } from "vue";
import hljs from "highlight.js";
import "@/components/CodeHighlight/hljs.less";

export function registerHighlight(app: App): void {
  hljs.configure({
    tabReplace: "  ",
  });
  // 注册代码高亮指令
  app.directive("highlight", {
    beforeMount(el: any, binding: any) {
      const targets = el.querySelectorAll("code");
      const arg = binding.arg ? binding.arg : "json";
      targets.forEach((target: HTMLElement) => {
        if (typeof binding.value === "string") {
          target.textContent = binding.value;
        }
        target.classList.add(`language-${arg}`);
        hljs.highlightBlock(target);
      });
    },
    updated(el: any, binding: any) {
      const targets = el.querySelectorAll("code");
      const arg = binding.arg ? binding.arg : "json";
      targets.forEach((target: HTMLElement) => {
        if (typeof binding.value === "string") {
          target.textContent = binding.value;
          target.classList.add(`language-${arg}`);

          hljs.highlightBlock(target);
        }
      });
    },
  });
  app.use(hljs.vuePlugin);
}
