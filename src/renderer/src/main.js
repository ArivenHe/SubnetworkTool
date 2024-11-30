// main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from '../router';
import '../res/css/base.css'
import CommonlyUsed from '../controllers/IpControllers';


const app = createApp(App)
const commonlyUsedInstance = new CommonlyUsed();
app.config.globalProperties.$common = commonlyUsedInstance;
app.use(router)
app.use(ElementPlus)
app.mount('#app')
