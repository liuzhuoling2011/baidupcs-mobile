<template>
  <div class="route-user">
    <mv-page class="page-intro" v-model="isShowIntro">
      <h3>BaiduPCS-Go Web版本</h3>
      <p><v-icon icon="email"></v-icon> liuzhuoling2011@hotmail.com</p>
      <p><v-icon icon="github"></v-icon> <a href="https://github.com/liuzhuoling2011/baidupcs-web" target="_blank">https://github.com/liuzhuoling2011/baidupcs-web</a>
      </p>
      <p>感谢 iikira 提供了高速, 稳定可靠的百度云后台服务</p>
      <p><v-icon icon="github"></v-icon> <a href="https://github.com/iikira/BaiduPCS-Go" target="_blank">https://github.com/iikira/BaiduPCS-Go</a></p>
    </mv-page>

    <mv-page class="page-set-lock" v-model="isShowSetLock">
      <div class="mv-field">
        <input class="input" type="password" placeholder="原锁定密码(第一次设置可不填)" v-model="oldLockPwd">
      </div>
      <div class="mv-field">
        <input class="input" type="password" placeholder="新锁定密码" v-model="newLockPwd">
      </div>

      <button class="mv-btn btn-wide" type="button" @click="setLockPwd">确定</button>
    </mv-page>

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
      <div class="item item-direct" @click="notDev">
        <v-icon icon="setting"></v-icon><span>设置</span>
      </div>
      <div class="item item-direct" @click="$router.push('/login')">
        <v-icon icon="refresh"></v-icon><span>切换账号</span>
      </div>
      <div class="item item-direct" @click="notDev">
        <v-icon icon="link"></v-icon><span>离线下载</span>
      </div>
    </div>

    <div class="mv-row"><span @click="showIntro">简介</span></div>
    <!-- <div class="mv-row"><span @click="showSetLock">设置锁定密码</span></div> -->
    <div class="mv-row"><span @click="checkUpdate">检查更新</span></div>
    <div class="mv-row"><span @click="notDev">帮助与反馈</span></div>
    <div class="mv-row row-exit"><span @click="logout">退出</span></div>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import {Toast, Indicator, MessageBox} from 'mint-ui'

  export default {
    name: 'User',
    data() {
      return {
        quota: {},
        isShowIntro: false,
        isShowSetLock: false,
        oldLockPwd: '',
        newLockPwd: ''
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
      async checkUpdate() {
        const body = await $axios.get('setting?method=update').catch(this.error)
        if (body.data.code === 0) {
          this.updateVersion = JSON.parse(body.data.data).data.filename
          if (this.updateVersion.length > 1) {
            MessageBox('提示', '有新版本更新，请在电脑上下载新版本！')
          } else {
            MessageBox('提示', '您目前使用的版本是最新的, 无需更新！')
          }
        }
      },
      showIntro() {
        this.isShowIntro = true
      },
      showSetLock() {
        this.oldLockPwd = ''
        this.newLockPwd = ''
        this.isShowSetLock = true
      },
      async setLockPwd() {
        if (!this.newLockPwd) {
          Toast({
            message: '密码不能为空',
            position: 'top',
            duration: 1000
          })
          return
        }

        const body = await $axios.get(`password?method=set&oldpass=${this.oldLockPwd}&password=${this.newLockPwd}`).catch(this.error)
        if (body.data.code === 0) {
          Toast('设置成功')
          localStorage.lastUnlockTime = new Date().getTime()
        }

        if (body.data.code === -3) {
          Toast(body.data.msg)
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
      notDev() {
        Toast('待开发')
      }
    },
    created() {
      this.getQuota()
    }
  }
</script>
