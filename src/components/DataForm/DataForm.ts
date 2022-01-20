import { defineComponent, h, PropType, ref, UnwrapRef, reactive, toRaw, watch } from "vue";
import {
  Button,
  Modal,
  Alert,
  Select,
  Space,
  Form as AForm,
  Input,
  Dropdown,
  Menu,
  Checkbox,
  TreeSelect,
} from "ant-design-vue";
import { FormItemType } from "./interface";
import { ValidateErrorEntity, Rule } from "ant-design-vue/lib/form/interface";
import "./dataForm.less";
import AppSelect from "../AppSelect";

function renderItemInput(item: FormItemType, _vm: any) {
  let inputProps: any = {
    ...item.props,
    value: _vm.formData[item.field],
  };
  let inputCom: any = Input;
  switch (item.type) {
    case "select":
      inputCom = Select;
      inputProps.onChange = (value: string) => {
        _vm.formData[item.field] = value;
        item.onChange && item.onChange(value);
      };
      break;
    case "group-select":
      inputCom = TreeSelect;
      inputProps.onChange = (value: string) => {
        _vm.formData[item.field] = value;
        item.onChange && item.onChange(value);
      };
      break;
    case "app-select":
      inputCom = AppSelect;
      inputProps.style = {
        width: "100%",
      };
      inputProps.showLock = false;
      inputProps.onChange = (appKey: string) => {
        _vm.formData[item.field] = appKey;
        item.onChange && item.onChange(appKey);
      };
      break;
    default:
      inputProps.onInput = (e: any) => {
        _vm.formData[item.field] = e.target.value;
      };
      break;
  }

  return h(inputCom, inputProps);
}

function renderItemLabel(item: FormItemType) {
  let colon = item.colon !== false ? "colon" : "";
  return h(
    "div",
    {
      class: ["data-form-item_title", colon],
    },
    [item.title]
  );
}

function renderItemContent(item: FormItemType, _vm: any) {
  return h(
    "div",
    {
      style: { width: item.titleWidth },
      class: "data-form-item-content",
    },
    [renderItemInput(item, _vm)]
  );
}

function renderFormItems(layout: string, items: FormItemType[], _vm: any) {
  return items
    ? items.map((item) => {
        const formItemProps: any = {
          name: item.field,
          style: item.style ? item.style : {},
          class: ["data-form-item", item.class],
        };
        if (layout === "grid") {
          // grid模式下每个单元格所占格
          if (item.colspan) {
            let itemColspan = "";
            formItemProps.style["gridColumn"] = "span " + item.colspan;
          }
          if (item.rowspan && item.rowspan > 1) {
            formItemProps.style["gridRow"] = "span " + item.rowspan;
          }
        }
        let wrapperProps = {
          class: ["data-form-item-wrapper", item.align],
        };
        let formItemContent = renderItemContent(item, _vm);

        return h(AForm.Item, formItemProps, {
          label() {
            return renderItemLabel(item);
          },
          default() {
            return h("div", wrapperProps, [formItemContent]);
          },
        });
      })
    : [];
}

function handleFormRules(items: FormItemType[]) {
  let rules: any = {};
  if (items && items.length) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.rules && item.rules.length) {
        rules[item.field] = item.rules;
      }
    }
  }
  return rules;
}

export default defineComponent({
  components: {},
  props: {
    layout: {
      type: String as PropType<string>,
      default: "grid",
    },
    items: {
      type: Array as PropType<FormItemType[]>,
      default: () => {
        return [];
      },
    },
    colspan: {
      type: Number as PropType<number>,
      default: 1,
    },
    data: Object as PropType<ObjectType>,
    rules: {
      type: Object as PropType<Rule[]>,
      default: () => {
        return {};
      },
    },
  },
  setup(props) {
    const formRef = ref();
    let formData: UnwrapRef<any> = reactive({});
    if (props.data) {
      formData = reactive(props.data);
    }
    const itemsRules = handleFormRules(props.items);
    const formRules = { ...props.rules, ...itemsRules };

    watch(
      () => props.data,
      (v) => {
        if (v) {
          for (const key in v) {
            formData[key] = v[key];
          }
        }
      }
    );

    const onSubmit = () => {
      return new Promise((resolve, reject) => {
        formRef.value
          .validate()
          .then(() => {
            console.log("values", formData, toRaw(formData));
            resolve(formData);
          })
          .catch((error: ValidateErrorEntity<any>) => {
            console.log("error", error);
            reject(error);
          });
      });
    };

    const getData = () => {
      return toRaw(formData);
    };

    return {
      formRef,
      formData,
      onSubmit,
      getData,
      formRules,
    };
  },
  render() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that: any = this;
    const { items, layout, formData, colspan, formRules } = this;

    let formStyle: any = {};
    if (layout === "grid") {
      let formColnumStyle = "";
      for (let i = 0; i < colspan; i++) {
        formColnumStyle += " 1fr";
      }
      formStyle["grid-template-columns"] = formColnumStyle;
    }
    console.log(formRules);

    return h(
      AForm,
      {
        ref: "formRef",
        class: ["data-form", layout],
        model: formData,
        style: formStyle,
        rules: formRules,
      },
      {
        default() {
          return renderFormItems(layout, items, that);
        },
      }
    );
  },
});
