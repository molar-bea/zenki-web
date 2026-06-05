import { createApp } from 'vue'
// Import the global CSS you shared earlier
import './styles/global.css' 
// Import your root component
import App from './App.vue'
import router from './route'     

// Create the app and mount it to the element with id="app"
const app = createApp(App)
app.use(router) 
app.mount('#app')