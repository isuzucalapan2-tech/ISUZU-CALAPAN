import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './Router/Router.js'
import { useAuthStore } from './stores/auth'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth state before mounting
const authStore = useAuthStore()
authStore.initializeAuth().then(() => {
  app.mount('#app')
})
