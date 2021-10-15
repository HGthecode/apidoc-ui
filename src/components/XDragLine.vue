<template>
  <div
    class="drag-line-x"
    @mousedown="mouseDown"
    @mouseup="mouseUp"
    :style="{ left: lastX + 'px' }"
  ></div>
</template>

<script lang="ts">
import { reactive, defineComponent, toRefs } from "vue";

export default defineComponent({
  emits: ["mouseUpChange", "mouseMoveChange"],
  props: {
    value: {
      type: Number,
      default: 200,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 0,
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      lastX: props.value,
    });

    const mouseDown = (event: MouseEvent) => {
      document.addEventListener("mousemove", mouseMove);
      state.lastX = event.screenX;
    };
    const mouseMove = (event: MouseEvent) => {
      const { screenX } = event;
      if (props.min > 0 && screenX < props.min) {
        state.lastX = props.min;
        document.removeEventListener("mousemove", mouseMove);
      } else if (props.max > 0 && screenX > props.max) {
        state.lastX = props.max;
        document.removeEventListener("mousemove", mouseMove);
      } else {
        state.lastX = screenX;
      }
      emit("mouseMoveChange", state.lastX);
    };
    const mouseUp = () => {
      if (props.min > 0 && state.lastX < props.min) {
        state.lastX = props.min;
      } else if (props.max > 0 && state.lastX > props.max) {
        state.lastX = props.max;
      }
      emit("mouseUpChange", state.lastX);
      document.removeEventListener("mousemove", mouseMove);
    };

    return { ...toRefs(state), mouseDown, mouseUp };
  },
});
</script>
<style lang="less" scoped>
.drag-line-x {
  position: absolute;
  top: 0;
  right: -2px;
  z-index: 100;
  width: 3px;
  height: 100%;
  cursor: col-resize;
  border-top: none;
  border-bottom: none;

  &.hide {
    display: none;
  }

  &:hover {
    background: var(--theme-color);
    box-shadow: 0 0 4px 0 rgba(28, 36, 56, 0.15);
  }
}
</style>
