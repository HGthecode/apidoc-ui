import { useApidocStore } from '/@/store/modules/apidoc'
import { monaco } from '/@/components/MonacoEditor/customMonaco'
export default (): void => {
  const apidocStore = useApidocStore()
  monaco.languages.registerHoverProvider('json', {
    provideHover: (model, position) => {
      const hoverDom = model.getWordAtPosition(position)
      if (hoverDom && hoverDom.word && apidocStore.currentEditorHoverTipsParams) {
        const key = `${hoverDom.word}_${hoverDom.startColumn}`
        const contents = apidocStore.currentEditorHoverTipsParams[key]
        return {
          contents: contents,
        }
      }
    },
  })
}
