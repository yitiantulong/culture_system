import { createApp } from 'vue'
import App from './App.vue' // 类型声明已修复
import './assets/base.css'
import router from './router'

const app = createApp(App)

app.config.globalProperties.$filters = {
  formatDate(value: string | number | Date) {
    return new Date(value).toLocaleString()
  }
}

app.use(router)
app.mount('#app')
