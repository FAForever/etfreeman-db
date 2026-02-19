import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useUnitDataStore } from './stores/unitData.js'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const unitStore = useUnitDataStore()

unitStore.loadData().catch(error => {
  console.error('Failed to load unit data:', error)
})

app.mount('#app')
