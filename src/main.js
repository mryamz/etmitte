import Vue from 'vue';
import App from './App.vue';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import axios from 'axios';
import VueAxios from 'vue-axios';
import LoadScript from 'vue-plugin-load-script';

import router from './router'

Vue.config.productionTip = false
Vue.use(VueAxios, axios);
Vue.use(LoadScript);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

