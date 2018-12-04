import Vue from 'vue'
import Mint from 'mint-ui'
import 'mint-ui/lib/style.css'
import './less/common.less'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import config from './config'

Vue.use(Mint)
Vue.config.productionTip = false

window.$axios = axios.create({
  baseURL: `${config.base_url}/api/v1/`
})

store
    .dispatch('init')
    .then(() => {
      new Vue({
        router,
        store,
        render: h => h(App)
      }).$mount('#app')
    })
