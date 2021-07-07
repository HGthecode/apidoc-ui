import {
  defineComponent,
  ref,
  onMounted,
  watch,
  onBeforeUnmount,
  shallowReadonly,
  shallowRef,
} from "vue";

import * as Monaco from "monaco-editor";

import type { PropType, Ref } from "vue";

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
  },
  setup(props) {
    // must be shallowRef, if not, editor.getValue() won't work
    const editorRef = shallowRef();

    const containerRef = ref();

    let _subscription: Monaco.IDisposable | undefined;
    let __prevent_trigger_change_event = false;

    onMounted(() => {
      const editor = (editorRef.value = Monaco.editor.create(containerRef.value, {
        value: props.code,
        language: "json",
        formatOnPaste: true,
        tabSize: 2,
        automaticLayout: true,
        foldingStrategy: "indentation",
        minimap: {
          enabled: false,
        },
      }));

      _subscription = editor.onDidChangeModelContent((event) => {
        console.log("--------->", __prevent_trigger_change_event);
        if (!__prevent_trigger_change_event) {
          props.onChange(editor.getValue(), event);
        }
      });
    });

    onBeforeUnmount(() => {
      if (_subscription) _subscription.dispose();
    });

    watch(
      () => props.code,
      (v) => {
        const editor = editorRef.value;
        const model = editor.getModel();
        if (v !== model.getValue()) {
          editor.pushUndoStop();
          __prevent_trigger_change_event = true;
          // pushEditOperations says it expects a cursorComputer, but doesn't seem to need one.
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
        // if (v !== editorRef.value.getValue()) {
        //   editorRef.value.setValue(v)
        // }
      }
    );

    return () => {
      return <div class="code-editor" style="width:100%;height:300px" ref={containerRef}></div>;
    };
  },
});
