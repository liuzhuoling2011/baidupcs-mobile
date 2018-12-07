import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Login from './views/Login'
import Nav from './components/Nav'
import Lock from './views/Lock.vue'
import Share from './views/Share.vue'
import store from './store'

Vue.use(Router)

const router = new Router({
  // mode: 'history',
  routes: [
    { path: '/', name: 'Home',
      components: {
        default: Home,
        nav: Nav
      },
      meta: { auth: true }
    },
    { path: '/login', component: Login },
    { path: '/lock', component: Lock },
    { path: '/share', name: 'Share',
      components: {
        default: Share,
        nav: Nav
      },
      meta: { auth: true }
    },
    {
      path: '/download',
      components: {
        default: () => import(/* webpackChunkName: "download" */ './views/Download'),
        nav: Nav
      },
      meta: { auth: true }
    },
    {
      path: '/recycle',
      component: () => import(/* webpackChunkName: "recycle" */ './views/Recycle'),
      meta: { auth: true }
    },
    {
      path: '/user',
      components: {
        default: () => import(/* webpackChunkName: "user" */ './views/User'),
        nav: Nav
      },
      meta: { auth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.auth)) {
    if (!store.state.login) {
      next('/login')
      return
    }
    if (store.state.isLock) {
      next('/lock')
      return
    }
  }
  next()
})

export default router