import './libs/iconfont'
import Vue from 'vue'
import Mint from 'mint-ui'
import 'mint-ui/lib/style.css'
import './less/common.less'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import config from './config'
import {Toast} from 'mint-ui'

import Icon from './components/Icon.vue'
import Page from './components/Page.vue'

Vue.use(Mint)
Vue.config.productionTip = false

Vue.component(Icon.name, Icon)
Vue.component(Page.name, Page)

window.$axios = axios.create({
  baseURL: `${config.base_url}/api/v1/`
})

Vue.prototype.error = function(msg) {
  Toast(msg)
}

store
    .dispatch('init')
    .then(() => {
      new Vue({
        router,
        store,
        render: h => h(App)
      }).$mount('#app')
    })
