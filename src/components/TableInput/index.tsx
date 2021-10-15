import { defineComponent, ref, watchEffect } from "vue";
import { Input } from "ant-design-vue";
import style from "./index.module.less";

export default defineComponent({
  props: {
    data: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
  },
  emits: ["change"],
  setup(props, { emit }) {
    const value = ref(props.data);

    function onChange(params: any) {
      emit("change", params);
    }

    watchEffect(() => {
      value.value = props.data;
    });
    return () => {
      return (
        <div class={style.tableInput}>
          <div class={style.tableInputWraper}>
            <Input value={value.value} onChange={onChange} placeholder={props.placeholder} />
          </div>
        </div>
      );
    };
  },
});
