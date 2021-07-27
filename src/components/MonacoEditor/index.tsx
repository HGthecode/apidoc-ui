import {
  defineComponent,
  ref,
  onMounted,
  watch,
  onBeforeUnmount,
  shallowRef,
  PropType,
  computed,
} from "vue";

import * as Monaco from "monaco-editor";

import { copyTextToClipboard } from "@/utils";
import { useStore } from "vuex";
import { GlobalState } from "@/store";
import { ThemeEnum, MonacoEditorThemeEnum } from "@/enums/appEnum";

export default defineComponent({
  props: {
    code: {
      type: String as PropType<string>,
      required: true,
    },
    onChange: {
      type: Function as PropType<
        (value: string, event: Monaco.editor.IModelContentChangedEvent) => void
      >,
      required: true,
    },
    height: {
      type: String as PropType<string>,
      default: "260px",
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    let store = useStore<GlobalState>();
    const editorRef = shallowRef();
    const isCopySuccess = ref(false);
    const containerRef = ref();
    const theme = computed(() => store.state.app.theme);

    let _subscription: Monaco.IDisposable | undefined;
    let __prevent_trigger_change_event = false;

    function getMonacoEditorTheme(theme: ThemeEnum): MonacoEditorThemeEnum {
      const key = theme.toUpperCase() as "DARK" | "LIGHT";
      return MonacoEditorThemeEnum[key];
    }

    onMounted(() => {
      const editor = (editorRef.value = Monaco.editor.create(containerRef.value, {
        value: props.code,
        language: "json",
        formatOnPaste: true,
        tabSize: 2,
        automaticLayout: true,
        readOnly: props.readOnly,
        foldingStrategy: "indentation",
        minimap: {
          enabled: false,
        },
        theme: getMonacoEditorTheme(theme.value),
      }));

      _subscription = editor.onDidChangeModelContent((event) => {
        if (!__prevent_trigger_change_event) {
          props.onChange(editor.getValue(), event);
        }
      });
    });

    onBeforeUnmount(() => {
      if (_subscription) _subscription.dispose();
    });

    watch(
      () => theme.value,
      (v) => {
        const theme = getMonacoEditorTheme(v);
        Monaco.editor.setTheme(theme);
      }
    );

    watch(
      () => props.code,
      (v) => {
        const editor = editorRef.value;
        const model = editor.getModel();
        if (v !== model.getValue()) {
          editor.pushUndoStop();
          __prevent_trigger_change_event = true;
          model.pushEditOperations(
            [],
            [
              {
                range: model.getFullModelRange(),
                text: v,
              },
            ]
          );
          editor.pushUndoStop();
          __prevent_trigger_change_event = false;
        }
      }
    );

    function onCopy() {
      props.code && copyTextToClipboard(props.code);
      isCopySuccess.value = true;
      setTimeout(() => {
        isCopySuccess.value = false;
      }, 1000);
    }

    return () => {
      return (
        <div class="code-editor-wraper" style={{ height: props.height }} ref={containerRef}></div>
      );
    };
  },
});
