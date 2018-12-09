<template>
  <div class="route-login">
    <div class="logo"><img src="../assets/logo.png"></div>
    <div class="login-form" v-if="loginWay === 'pwd'">
      <div class="mv-row"><input class="input" v-model="username" placeholder="用户名"></div>
      <div class="mv-row"><input class="input" type="password" v-model="password" placeholder="密码"></div>
      <div class="mv-row row-verify" v-if="showVerify">
        <select class="select" v-model="verifyType" v-if="showVerifyTypes">
          <option v-for="item of loginVerifyData.verifyTypes" :value="item.value">{{item.label}}</option>
        </select>
        <input class="input" v-model="verifyCode" placeholder="验证码">
        <img :src="loginVerifyData.verifyImg" v-if="showVerifyImg">
      </div>
      <div class="row-ways">
        <div class="way-other">
          <a class="link" v-if="loginWay === 'pwd'" @click="loginWay = 'bduss'">BDUSS登录</a>
        </div>
      </div>
      <div class="row-submit">
        <button class="mv-btn" type="button" @click="login">登录</button>
      </div>
    </div>

    <div class="login-form" v-if="loginWay === 'bduss'">
      <div class="mv-row"><input class="input" v-model="BDUSS" placeholder="BDUSS"></div>
      <div class="row-ways">
        <div class="way-other">
          <a class="link" v-if="loginWay === 'bduss'" @click="loginWay = 'pwd'">密码登录</a>
        </div>
      </div>
      <div class="row-submit">
        <button class="mv-btn" type="button" @click="loginWithBDUSS">登录</button>
      </div>
    </div>

    <div class="login-users" v-if="users.length">
      <h4>已登录用户</h4>
      <div class="users-list">
        <div class="l-user" v-for="user of users" @click="selectUser(user)">{{user.name}}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapState, mapMutations} from 'vuex'
  import {Toast, Indicator} from 'mint-ui'
  import utils from '../libs/util'

  export default {
    name: 'v-login',
    data() {
      return {
        login_status: 1,
        username: '',
        password: '',
        verifyCode: '',
        verifyType: '',
        users: [],
        showVerify: false,
        showVerifyTypes: false,
        showVerifyImg: false,
        loginWay: 'pwd',
        BDUSS: ''
      }
    },
    computed: {
      ...mapState(['globals', 'websocket', 'loginVerifyStatus', 'loginVerifyData'])
    },
    watch: {
      'loginVerifyStatus'(val) {
        Indicator.close()

        switch (val) {
          case 2: //需要验证手机或邮箱
            this.verifyCode = ''
            this.showVerify = true
            this.showVerifyTypes = true
            this.showVerifyImg = false
            break
          case 3: //发送验证码
            Toast('验证码已发送')
            break
          case 4: //验证码错误
            Toast('验证码错误')
            break
          case 5: //账号或密码错误
            Toast('账号或者密码错误')
            break
          case 6: //使用图片验证码
            this.verifyCode = ''
            this.showVerify = true
            this.showVerifyTypes = false
            this.showVerifyImg = true
            break
          case 7: //登录成功
            location.href = '/dist'
            localStorage.lastUnlockTime = new Date().getTime()
            break
        }
      },
      verifyType() {
        this.verifyCode = ''
        this.login()
      },
      async loginWithBDUSS() {
        if (this.BDUSS === '') return

        const body = await $axios.get(`user?method=login&bduss=${this.BDUSS}`).catch(this.error)
        if (body === undefined) return
        if (body.data.code === 0) {
          location.href = '/dist'
        }
      }
    },
    methods: {
      ...mapMutations(['initWS']),
      async login() { // 数据发送
        Indicator.open()
        if (this.websocket === null) this.initWS()

        while (this.websocket.readyState !== 1) {
          await utils.sleep(500)
        }
        const data = {
          type: 1,
          status: this.login_status,
          username: this.username,
          password: this.password
        }

        if (this.verifyType !== '') data.verify_type = this.verifyType
        if (this.verifyCode !== '') data.verify_code = this.verifyCode

        this.websocket.send(JSON.stringify(data))
      },
      async selectUser(user) {
        Indicator.open()
        const body = await $axios.get(`user?method=set&name=${user.name}`).catch(this.error)
        Indicator.close()
        if (body === undefined) return
        if (body.data.code === 0) {
          location.href = '/dist'
        }
      }
    },
    async created() {
      const body = await $axios.get('user?method=list').catch(this.error)
      if (body === undefined) return
      if (body.data.code === 0) {
        this.users = body.data.data
      }
    }
  }
</script>
