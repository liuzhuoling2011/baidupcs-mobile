<template>
  <div class="route-user">
    <div class="user-data">
      <div class="i-avatar"></div>
      <div class="i-info">
        <div class="i-name"><span class="n-name">{{user.name}}</span><span class="n-sex">{{user.sex}}</span></div>
        <div class="i-quota">
          <div class="q-progress"></div>
          <div class="q-data">{{quota.used}}/{{quota.quota}} {{quota.percent}}%</div>
        </div>
      </div>
    </div>

    <div class="banner"></div>

    <div class="route-lists">
      <div class="item">
        <router-link class="item-link" to="/recycle">
          <v-icon icon="delete"></v-icon><span>回收站</span>
        </router-link>
      </div>
      <div class="item item-direct">
        <v-icon icon="setting"></v-icon><span>设置</span>
      </div>
      <div class="item item-direct">
        <v-icon icon="refresh"></v-icon><span>切换账号</span>
      </div>
      <div class="item item-direct">
        <v-icon icon="link"></v-icon><span>离线下载</span>
      </div>
    </div>

    <div class="mv-row"><span>简介</span></div>
    <div class="mv-row"><span>设置锁定密码</span></div>
    <div class="mv-row"><span>检查更新</span></div>
    <div class="mv-row"><span>帮助与反馈</span></div>
    <div class="mv-row row-exit"><span @click="logout">退出</span></div>
  </div>
</template>

<script>
  import {mapState, mapMutations} from 'vuex'
  import {Toast, Indicator, MessageBox} from 'mint-ui'

  export default {
    name: 'User',
    data() {
      return {
        quota: {}
      }
    },
    computed: {
      ...mapState(['user'])
    },
    methods: {
      async getQuota() {
        const quota = await $axios.get('quota').catch(this.error)
        if (quota.data.code === 0) {
          this.quota = JSON.parse(quota.data.data)
        }
      },
      logout() {
        MessageBox.confirm('退出登录?').then(async () => {
          Indicator.open()
          await $axios.get('logout')
          Indicator.close()
          location.reload()
        }).catch(() => {
        })
      },
    },
    created() {
      this.getQuota()
    }
  }
</script>
