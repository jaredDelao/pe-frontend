import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { initTheme } from './composables/useTheme'
import './assets/styles/main.css'

const app = createApp(App)

app.use(createPinia())

useAuthStore().restore()
initTheme()

app.use(router)
app.mount('#app')
