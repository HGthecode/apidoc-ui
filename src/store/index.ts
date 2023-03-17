import { createPinia } from 'pinia'
import { useAppStore } from './modules/app'
import { useApidocStore } from './modules/apidoc'

const pinia = createPinia()

export { useAppStore, useApidocStore }
export default pinia
