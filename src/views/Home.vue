<template>
  <div class="route-home">
    <div class="home-page-1">
      <mt-header fixed>
        <template slot="left">
          <div class="home-header-left" v-show="isHome">
            <mt-search v-model="keywords" placeholder="搜索网盘文件"></mt-search>
          </div>
          <div class="non-home-header-left" v-show="!isHome" @click="back">
            <mt-button icon="back"></mt-button>
            <span>{{currentFolder.title}}</span>
          </div>
        </template>

        <template slot="right">
          <v-icon icon="plus"></v-icon>
          <v-icon icon="more-h"></v-icon>
        </template>
      </mt-header>
      <div class="list">
        <mt-cell v-for="(item, i) of currentFolders" :key="i" :title="item.title" @click.native="openDir(item)">
          <v-icon icon="folder-flat" slot="icon" v-if="item.isdir"></v-icon>
          <v-icon icon="file" slot="icon" v-else></v-icon>
          <template slot="right">
            <label class="mint-checklist-label" @click.stop>
              <span class="mint-checkbox">
                <input class="mint-checkbox-input" type="checkbox" name="fileOrDir" v-model="selected" :value="item.path">
                <span class="mint-checkbox-core"></span>
              </span>
              <span class="mint-checkbox-label"></span>
            </label>
          </template>
        </mt-cell>
      </div>
    </div>
  </div>
</template>
<script>
  import {mapState, mapMutations} from 'vuex'
  import utils from '../libs/util'

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
        selected: []
      }
    },
    computed: {
      ...mapState(['globals', 'websocket']),
      isHome() {
        return this.folderStack.length === 1
      }
    },
    methods: {
      ...mapMutations(['initWS']),
      async getFiles() {
        const Data = [], Data1 = []
        const result = await $axios.get('files?path=/').catch(this.error)

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
      },
      openDir(item) {
        if (!item.isdir) return

        this.getPathData(item.path, this.setCurrentFolder)
        this.currentFolder = item
        this.folderStack.push(item)
      },
      setCurrentFolder(data) {
        this.currentFolders = data
      },
      back() {
        this.folderStack.pop()
        if (this.folderStack.length === 1) {
          this.getPathData('/', this.setCurrentFolder)
          this.currentFolder = {}
        } else {
          const toFolder = this.folderStack[this.folderStack.length - 1]
          this.getPathData(toFolder.path, this.setCurrentFolder)
          this.currentFolder = toFolder
        }
      }
    },
    mounted() {
      this.getFiles()
    }
  }
</script>