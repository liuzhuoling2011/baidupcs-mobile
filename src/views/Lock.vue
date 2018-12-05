<template>
  <div class="route-lock">
    <div class="form">
      <input class="input" type="password" placeholder="输入锁定密码" v-model="lockPwd">
      <button class="mv-btn" type="button" @click="unlock">解锁</button>
    </div>
  </div>
</template>

<script>
  import {mapMutations} from 'vuex'

  export default {
    data() {
      return {
        isShowModal: true,
        lockPwd: ''
      }
    },
    methods: {
      ...mapMutations(['setIsLock']),
      async unlock() {
        const body = await $axios.get(`password?method=verify&password=${this.lockPwd}`).catch(this.error)
        if (body === undefined) return

        if (body.data.code === 0) {
          if (body.data.data) {
            this.setIsLock(false)
            this.$router.replace('/')
            localStorage.lastUnlockTime = new Date().getTime()
          } else {
            this.$Message.error('密码错误')
          }
        }
      }
    }
  }
</script>