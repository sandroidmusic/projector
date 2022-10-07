import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import VueComponent from './utils/VueComponent';

const app = createApp(App);
app.use(createPinia())
VueComponent.appContext = app._context;
app.mount('#app');
