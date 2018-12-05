<template>
  <div class="route-home">
    <div class="home-page-1">
      <header class="mv-header">
        <div class="header-left">
          <div class="home-header-left" v-show="isHome">
            <mt-search v-model="keywords" placeholder="搜索网盘文件"></mt-search>
          </div>
          <div class="non-home-header-left" v-show="!isHome" @click="back">
            <v-icon icon="left"></v-icon>
            <span>{{currentFolder.title}}</span>
          </div>
        </div>

        <div class="header-right">
          <v-icon icon="plus"></v-icon>
          <v-icon icon="more-h"></v-icon>
        </div>
      </header>

      <header class="mv-header mv-header-select" v-if="hasSelected">
        <div class="h-item l"><a class="link" @click="cancelSelect">取消</a></div>
        <div class="h-item m">已选中{{selected.length}}个文件</div>
        <div class="h-item r">
          <a class="link" @click="unselectAll" v-if="isSelectAll">全不选</a>
          <a class="link" @click="selectAll" v-else>全选</a>
        </div>
      </header>

      <div class="list">
        <div class="mv-row" v-for="(item, i) of currentFolders" :key="i" @click="openDir(item)">
          <div class="cell l">
            <v-icon icon="folder-flat" slot="icon" v-if="item.isdir"></v-icon>
            <v-icon icon="file" slot="icon" v-else></v-icon>
          </div>
          <div class="cell m">{{item.title}}</div>
          <div class="cell r" @click.stop>
            <label class="mv-checkbox">
              <input type="checkbox" name="fileOrDir" v-model="selected" :value="item.path">
              <span></span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="mv-tab mv-tab-actions" v-if="hasSelected">
      <div class="t-item" @click="downloadFiles"><span>下载</span></div>
      <div class="t-item" @click="shareFiles"><span>分享</span></div>
      <div class="t-item"><span>删除</span></div>
      <div class="t-item" :class="{disabled: selected.length > 1}"><span>重命名</span></div>
      <div class="t-item"><span>更多</span></div>
    </div>
  </div>
</template>
<script>
  import {mapState, mapMutations} from 'vuex'
  import utils from '../libs/util'
  import {Toast, Indicator} from 'mint-ui'

  export default {
    name: 'Home',
    data() {
      return {
        keywords: '',
        options: [
          { label: 'a', value: 'a' },
        ],
        folders: [
          {
            title: '主目录',
            path: '/',
            loading: false,
            expand: true,
            children: []
          }
        ],
        currentFolders: [],
        folderStack: ['/'],
        currentFolder: {},
        selected: [],
        isSelectAll: false
      }
    },
    computed: {
      ...mapState(['globals', 'websocket']),
      isHome() {
        return this.folderStack.length === 1
      },
      hasSelected() {
        return this.selected.length > 0
      }
    },
    methods: {
      ...mapMutations(['initWS']),
      async getFiles() {
        Indicator.open()
        const Data = [], Data1 = []
        const result = await $axios.get('files?path=/').catch(this.error)
        Indicator.close()

        const data = result.data
        if (data.error_code) {
          Toast(data.error_msg)
          return
        }

        const fdata = result.data.list
        for (let i = 0; i < fdata.length; i++) {
          const fd = fdata[i]
          const node = {
            path: fd.path,
            title: fd.server_filename,
            size: utils.bytesToSize(fd.size),
            mtime: utils.formatDateTime(fd.server_mtime * 1000),
            ctime: utils.formatDateTime(fd.server_ctime * 1000)
          }

          if (fd.isdir === 1) {
            Data.push({
              ...node,
              isdir: true,
              loading: false,
              children: []
            })
            Data1.push({
              ...node,
              isdir: true,
              loading: false,
              children: []
            })
          } else {
            Data.push({
              ...node,
              isdir: false
            })
          }
        }
        this.folders[0].children = Data1
        this.currentFolders = Data
      },
      async getPathData(path, func, only_folder = false, orderby = 'name', order = 'asc') {
        const Data = []
        const result = await $axios.get(`files?path=${encodeURIComponent(path)}&order_by=${orderby}&order=${order}`).catch(this.error)
        const fdata = result.data.list;
        for (var i = 0; i < fdata.length; i++) {
          var fd = fdata[i];
          if (fd.isdir === 1) {
            Data.push({
              path: fd.path,
              title: fd.server_filename,
              isdir: true,
              size: utils.bytesToSize(fd.size),
              mtime: utils.formatDateTime(fd.server_mtime * 1000),
              ctime: utils.formatDateTime(fd.server_ctime * 1000),
              loading: false,
              children: []
            })
          } else if (only_folder === false) {
            Data.push({
              path: fd.path,
              title: fd.server_filename,
              size: utils.bytesToSize(fd.size),
              mtime: utils.formatDateTime(fd.server_mtime * 1000),
              ctime: utils.formatDateTime(fd.server_ctime * 1000),
              isdir: false
            })
          }
        }
        func(Data)
        return true
      },
      async openDir(item) {
        if (!item.isdir) return

        Indicator.open()
        await this.getPathData(item.path, this.setCurrentFolder)
        Indicator.close()
        this.currentFolder = item
        this.folderStack.push(item)
      },
      setCurrentFolder(data) {
        this.currentFolders = data
      },
      async back() {
        Indicator.open()
        this.folderStack.pop()
        if (this.folderStack.length === 1) {
          await this.getPathData('/', this.setCurrentFolder)
          this.currentFolder = {}
        } else {
          const toFolder = this.folderStack[this.folderStack.length - 1]
          await this.getPathData(toFolder.path, this.setCurrentFolder)
          this.currentFolder = toFolder
        }
        Indicator.close()
      },
      cancelSelect() {
        this.selected = []
      },
      selectAll() {
        this.isSelectAll = true
        this.selected = this.currentFolders.map(item => item.path)
      },
      unselectAll() {
        this.isSelectAll = false
        this.selected = []
      },
      async downloadFiles() {
        if (this.websocket === null) this.initWS()

        while (this.websocket.readyState !== 1) {
          await utils.sleep(500)
        }

        this.websocket.send(JSON.stringify({
          type: 2,
          method: 'download',
          paths: this.selected
        }))
        Toast('已经添加到下载队列!')
        this.unselectAll()
      },
      async shareFiles() {
        let paths = ''
        this.selected.forEach(item => {
          paths += `${item}|`
        })
        paths = paths.slice(0, -1)

        const result = await $axios.get(`share?method=set&paths=${encodeURIComponent(paths)}`).catch(this.error)
        if (result.data.code === 0) {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(result.data.msg)
            Toast('分享成功, 分享链接已复制到剪贴板')
          } else {
            Toast('分享成功, 请前往分享面板查看')
          }
        } else {
          this.error(result.data.msg)
        }
      },
    },
    mounted() {
      this.getFiles()
    }
  }
</script>