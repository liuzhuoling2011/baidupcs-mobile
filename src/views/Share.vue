<template>
  <div class="route-share">
    <div class="no-data" v-if="!items.length">暂无分享的文件</div>
    <div class="mv-row" v-for="item of items">
      <div class="cell l"></div>
      <div class="cell m">
        <div class="file-name">
          <v-icon icon="folder-flat" slot="icon" v-if="item.isdir"></v-icon>
          <v-icon icon="file" slot="icon" v-else></v-icon>
          <span>{{item.name}}</span>
        </div>
        <div class="file-url">{{item.link}}</div>
      </div>
      <div class="cell r" @click="cancelShare(item.id)"><v-icon icon="close"></v-icon></div>
    </div>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import {Toast, Indicator} from 'mint-ui'

  export default {
    name: 'Share',
    data() {
      return {
        items: []
      }
    },
    computed: {
      ...mapState(['globals'])
    },
    methods: {
      guessDirType(name) {
        let index = name.lastIndexOf('.');
        return !(index !== -1 && (name.length - index === 4 || name.length - index === 5));
      },
      async getShareList() {
        const result = await $axios.get('share?method=list').catch(this.error)
        if (result.data.code === 0) {
          this.items = []
          let shares = result.data.data
          shares.forEach(share => {
            const name = share.typicalPath.split('/').pop()
            let multi = ''
            if (share.fsIds.length > 1) multi = ' 等'

            this.items.push({
              id: share.shareId,
              name: name + multi,
              password: share.passwd || '无',
              link: share.shortlink,
              isDir: this.guessDirType(name),
              path: share.typicalPath,
              isDel: share.typicalPath === '分享的文件已被删除' || share.typicalPath === '分享已过期'
            })
          })
        } else {
          this.error(result.data.msg)
        }
      },
      async cancelShare(id) {
        Indicator.open()
        const result = await $axios.get(`share?method=cancel&id=${id}`).catch(this.error)
        Indicator.close()
        if (result.data.code === 0) {
          Toast('取消分享成功')
          this.items = this.items.filter(item => item.id !== id)
          return true
        }
        Toast(result.data.msg)
      }
    },
    mounted() {
      this.getShareList()
    }
  }
</script>