<template>
  <div class="mv-tab">
    <div class="t-item">
      <router-link to="/">文件</router-link>
    </div>
    <div class="t-item">
      <router-link to="/download">上传下载</router-link>
    </div>
    <div class="t-item">
      <router-link to="/share">分享</router-link>
    </div>
    <div class="t-item">
      <router-link to="/recycle">回收站</router-link>
    </div>
    <div class="t-item">
      <router-link to="/user">我的</router-link>
    </div>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import VShare from '../views/Share'
  import VRecycle from '../views/Recycle'

  export default {
    data() {
      return {
        selected: '',
        modalShareFlag: false,
        modalRecycleFlag: false,
        modalSettingFlag: false,
        quotaData: {
          flag: false,
          data: {}
        },
        formData: { config: [] },
        notices: [],
        updateVersion: [],
        updateFlag: false,
        modalSetLockFlag: false,
        oldLockPwd: '',
        newLockPwd: '',
        loadingRecycleFlag: false,
      }
    },
    computed: {
      ...mapState(['user', 'login'])
    },
    components: { VShare, VRecycle },
    methods: {
      logout() {
        this.$Modal.confirm({
          title: '退出登录',
          async onOk() {
            await $axios.get('logout')
            location.reload()
          }
        })
      },
      async getUpdate() {
        const body = await $axios.get('setting?method=update').catch(this.error)
        if (body.data.code === 0) {
          this.updateVersion = JSON.parse(body.data.data).data.filename
          if (this.updateVersion.length > 1) {
            this.updateFlag = true
          }
        }
      },
      async getNotice() {
        const body = await $axios.get('setting?method=notice').catch(this.error)
        if (body.data.code === 0) {
          let storage_key = 'baidupcs_notice_time'
          this.notices = JSON.parse(body.data.data).data
          for (let i = 0; i < this.notices.length; i++) {
            if (localStorage[storage_key] == null || localStorage[storage_key] < this.notices[i].CreatedAt) {
              localStorage.setItem(storage_key, this.notices[i].CreatedAt);
              this.$Notice.info({
                top: 50,
                duration: 10,
                title: "温馨提示",
                desc: this.notices[i].Msg,
              })
            }
          }
        }
      },
      async setLockPwd() {
        const body = await $axios.get(`password?method=set&oldpass=${this.oldLockPwd}&password=${this.newLockPwd}`).catch(this.error)
        if (body.data.code === 0) {
          this.$Message.success('设置成功')
          this.modalSetLockFlag = false
          localStorage.lastUnlockTime = new Date().getTime()
        }

        if (body.data.code === -3) {
          this.$Message.error(body.data.msg)
        }
      }
    },
    mounted() {
      this.getUpdate()
      this.getNotice()
    }
  }
</script>

<style lang="less" scoped>
  .layout {
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
  }

  .layout-logo {
    height: 100%;

    img {
      height: 100%;
    }
  }

  .ivu-menu-horizontal {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ivu-layout-header {
    height: 60px;
    line-height: 60px;
  }
</style>