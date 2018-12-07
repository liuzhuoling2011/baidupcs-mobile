<template>
  <section class="route-recycle">
    <header class="mv-header">
      <div class="header-l">
        <v-icon icon="left" @click.native="$router.go(-1)"></v-icon>
      </div>
      <div class="header-m">回收站</div>
      <div class="header-r">
        <a class="link" @click="clear">清空</a>
      </div>
    </header>
    <div class="no-data" v-if="!items.length">暂无删除的文件</div>
    <template v-else>
      <header class="mv-header mv-header-select" v-if="hasSelected">
        <div class="h-item l"><a class="link" @click="cancelSelect">取消</a></div>
        <div class="h-item m">已选中{{selected.length}}个文件</div>
        <div class="h-item r">
          <a class="link" @click="unselectAll" v-if="isSelectAll">全不选</a>
          <a class="link" @click="selectAll" v-else>全选</a>
        </div>
      </header>


      <div class="mv-row" v-for="item of items">
        <div class="cell l"></div>
        <div class="cell m">
          <div class="file-name"><span>{{item.name}}</span></div>
          <div class="file-info">
            <span class="file-size">{{item.size}}</span>
            <span class="file-left">{{item.leftTime}}后清除</span>
          </div>
        </div>
        <div class="cell r">
          <label class="mv-checkbox">
            <input type="checkbox" name="fileDeleted" v-model="selected" :value="item.fid">
            <span></span>
          </label>
        </div>
      </div>

      <div class="mv-tab mv-tab-actions" v-if="hasSelected">
        <div class="t-item" @click="restore"><span>还原</span></div>
        <div class="t-item" @click="del"><span>删除</span></div>
      </div>
    </template>
  </section>
</template>

<script>
  import utils from '../libs/util'
  import {Toast, Indicator} from 'mint-ui'

  export default {
    name: 'Recycle',
    data() {
      return {
        items: [],
        selected: [],
        isSelectAll: false
      }
    },
    computed: {
      hasSelected() {
        return this.selected.length > 0
      }
    },
    methods: {
      async getRecycleList() {
        Indicator.open()
        const result = await $axios.get('recycle?method=list').catch(this.error)
        Indicator.close()
        if (result.data.code === 0) {
          this.items = []
          let recycles = result.data.data
          recycles.forEach(recycle => {
            this.items.push({
              fid: recycle.fs_id,
              name: recycle.server_filename,
              leftTime: recycle.leftTime + ' 天',
              size: utils.bytesToSize(recycle.size),
              path: recycle.path,
            })
          })
        } else {
          Toast(result.data.msg)
        }
      },
      cancelSelect() {
        this.selected = []
      },
      selectAll() {
        this.isSelectAll = true
        this.selected = this.items.map(item => item.path)
      },
      unselectAll() {
        this.isSelectAll = false
        this.selected = []
      },
      async restore() {
        const fid = this.selected[0]
        Indicator.open()
          const result = await $axios.get(`recycle?method=restore&fid=${fid}`).catch(this.error)
        Indicator.close()
          if (result.data.code === 0) {
            Toast('还原回收站文件成功')
            this.items = this.items.filter(item => item.fid !== fid)
          } else {
              Toast(result.data.msg)
          }
      },
      async del() {
        const fid = this.selected[0]
        Indicator.open()
        const result = await $axios.get(`recycle?method=delete&fid=${fid}`).catch(this.error)
        Indicator.close()
        if (result.data.code === 0) {
          Toast('删除回收站文件成功')
          this.items = this.items.filter(item => item.fid !== fid)
        } else {
          Toast(result.data.msg)
        }
      },
      async clear() {
        Indicator.open()
        const body = await $axios.get('recycle?method=clear').catch(this.error)
        Indicator.close()
        if (body.data.code === 0) {
          Toast('清空回收站成功')
        }
      }
    },
    mounted() {
      this.getRecycleList()
    }
  }
</script>
