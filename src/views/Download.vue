<template>
  <section class="route-download">
    <header class="mv-header">
      <div class="h-item" :class="{focus: tabIndex === 0}" @click="tabIndex = 0"><span>下载列表</span></div>
      <div class="h-item" :class="{focus: tabIndex === 1}" @click="tabIndex = 1"><span>上传列表</span></div>
      <div class="h-item" :class="{focus: tabIndex === 2}" @click="tabIndex = 2"><span>离线下载</span></div>
    </header>

    <div class="panel panel-download" v-show="tabIndex === 0">
      <div class="row-cancel" v-if="globals.downloading.length || globals.pending_download.length">
        <button class="mv-btn btn-danger" type="button" @click="cancelAllDownload">全部取消</button>
      </div>
      <!--正在下载-->
      <div class="items-list">
        <div class="item item-ing" v-for="item of globals.downloading">
          <div class="i-name">{{item.name}}【{{item.total_size}}】</div>
          <div class="i-progress">
            <mt-progress :value="item.percent"></mt-progress>
          </div>
          <div class="i-info">
            <div class="ii-cell"><span>速度</span><span>{{item.speed}}/s</span></div>
            <div class="ii-cell"><span>已经下载</span><span>{{item.download_size}}</span></div>
            <div class="ii-cell"><span>已用时间</span><span>{{item.time_used}}</span></div>
            <div class="ii-cell"><span>预计还需</span><span>{{item.time_left}}</span></div>
          </div>
          <div class="i-actions">
            <button class="mv-btn" type="button" @click="switchDownloadStatus(item)">{{item.is_pause ? '继续下载' : '暂停'}}</button>
            <button class="mv-btn" type="button" @click="cancelTask(item)">取消</button>
          </div>
        </div>
      </div>
      <!--等待下载-->
      <div class="items-list">
        <div class="item item-ing" v-for="item of globals.pending_download">
          <div class="i-name">{{item.name}}【等待下载...】</div>
          <div class="i-info">
            <div class="ii-cell"><span>速度</span><span>{{item.speed}}/s</span></div>
            <div class="ii-cell"><span>已经下载</span><span>{{item.download_size}}</span></div>
            <div class="ii-cell"><span>已用时间</span><span>{{item.time_used}}</span></div>
            <div class="ii-cell"><span>预计还需</span><span>{{item.time_left}}</span></div>
          </div>
        </div>
      </div>
      <!--已完成-->
      <div class="items-list">
        <div class="item item-done" v-for="item of globals.downloaded">
          <div class="i-name">{{item.name}}【{{item.total_size}}】</div>
          <div class="i-info">
            <div class="ii-cell"><span>平均速度</span><span>{{item.avg_speed}}/s</span></div>
            <div class="ii-cell"><span>已用时间</span><span>{{item.time_used}}</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel panel-upload" v-show="tabIndex === 1">
      <div class="row-cancel" v-if="globals.uploading.length || globals.pending_upload.length">
        <button class="mv-btn btn-danger" type="button" @click="cancelAllUpload">全部取消</button>
      </div>
      <!--正在上传-->
      <div class="items-list">
        <div class="item item-ing" v-for="item of globals.uploading">
          <div class="i-name">{{item.name}}【{{item.total_size}}】</div>
          <div class="i-progress">
            <mt-progress :value="item.percent"></mt-progress>
          </div>
          <div class="i-info">
            <div class="ii-cell"><span>速度</span><span>{{item.speed}}/s</span></div>
            <div class="ii-cell"><span>已经上传</span><span>{{item.download_size}}</span></div>
            <div class="ii-cell"><span>已用时间</span><span>{{item.time_used}}</span></div>
            <div class="ii-cell"><span>预计还需</span><span>{{item.time_left}}</span></div>
          </div>
        </div>
      </div>
      <!--等待上传-->
      <div class="items-list">
        <div class="item item-ing" v-for="item of globals.pending_upload">
          <div class="i-name">{{item.name}}【等待上传...】</div>
          <div class="i-info">
            <div class="ii-cell"><span>速度</span><span>{{item.speed}}/s</span></div>
            <div class="ii-cell"><span>已经上传</span><span>{{item.download_size}}</span></div>
            <div class="ii-cell"><span>已用时间</span><span>{{item.time_used}}</span></div>
            <div class="ii-cell"><span>预计还需</span><span>{{item.time_left}}</span></div>
          </div>
        </div>
      </div>
      <!--已完成-->
      <div class="items-list">
        <div class="item item-done" v-for="item of globals.uploaded">
          <div class="i-name">{{item.name}}【{{item.total_size}}】</div>
          <div class="i-info">
            <div class="ii-cell"><span>平均速度</span><span>{{item.avg_speed}}/s</span></div>
            <div class="ii-cell"><span>已用时间</span><span>{{item.time_used}}</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import config from '../config'
  import utils from '../libs/util'
  import {mapState, mapMutations} from 'vuex'
  import {Toast, Indicator, MessageBox} from 'mint-ui'

  export default {
    name: 'v-download',
    data() {
      return {
        tabIndex: 0,
        select_menu_name: "1-1",
        base_url: config.base_url,
        ws_url: config.ws_url,
        modalDetailFlag: false,
        offline_downloaded: [],
        offline_downloading: []
      }
    },
    computed: {
      ...mapState(['globals', 'websocket'])
    },
    methods: {
      ...mapMutations(['initWS']),
      initWebSocket() {
        if (this.websocket === null) this.initWS()
      },
      async switchDownloadStatus(item) {
        Indicator.open()
        const method = item.is_pause ? 'resume' : 'pause'
        const result = await $axios.get(`download?method=${method}&id=${item.LastID}`).catch(this.error)
        Indicator.close()
        Toast(result.data.code === 0 ? '操作成功' : result.data.msg)
      },
      cancelTask(item) {
        MessageBox.confirm('删除任务后无法恢复, 确定吗?').then(async () => {
          Indicator.open()
          const result = await $axios.get(`download?method=cancel&id=${item.LastID}`).catch(this.error)
          Indicator.close()
          Toast(result.data.code === 0 ? '操作成功' : result.data.msg)
        }).catch(() => {})
      },
      getMenuName(name) {
        this.select_menu_name = name
        if (name === '3-1' || name === '3-2') {
          this.getOfflineTask()
        }
      },
      async deleteTask(item) {
        let method = 'delete'
        if (item.status !== 0) method = 'cancel'

        const result = await $axios.get(`offline_download?method=${method}&id=${item.taskid}`).catch(this.error)
        if (result.data.code === 0) {
          this.$Message.success("删除成功")
          this.getOfflineTask()
        } else {
          this.$Message.error({
            content: result.data.msg,
            duration: 10,
            closable: true
          })
        }
      },
      async getOfflineTask() {
        const result = await $axios.get('offline_download?method=list').catch(this.error)
        if (result.data.code === 0) {
          const fdata = result.data.data;
          let finishedData = [];
          let downloadingData = [];
          for (var i = 0; i < fdata.length; i++) {
            var fd = fdata[i];
            if (fd.Status === 0) {
              finishedData.push({
                taskid: fd.TaskID,
                taskname: fd.TaskName,
                status: fd.Status,
                status_text: fd.StatusText,
                file_size: utils.bytesToSize(fd.FileSize),
                finished_size: utils.bytesToSize(fd.FinishedSize),
                ftime: utils.formatDateTime(fd.FinishTime * 1000),
                path: fd.SavePath,
                url: fd.SourceURL,
                type: fd.OdType,
              });
            } else {
              let percent = ((fd.FinishedSize * 1) / (fd.FileSize * 1) * 100).toFixed(2);
              downloadingData.push({
                taskid: fd.TaskID,
                taskname: fd.TaskName,
                status: fd.Status,
                status_text: fd.StatusText,
                file_size: utils.bytesToSize(fd.FileSize),
                finished_size: utils.bytesToSize(fd.FinishedSize),
                percent: percent * 1,
                stime: utils.formatDateTime(fd.StartTime * 1000),
                path: fd.SavePath,
                url: fd.SourceURL,
                type: fd.OdType,
              });
            }
          }
          this.offline_downloaded = finishedData;
          this.offline_downloading = downloadingData;
          if (downloadingData.length > 0) {
            setTimeout(() => this.getOfflineTask(), 1000);
          }
        } else {
          this.$Message.error({
            content: result.data.msg,
            duration: 10,
            closable: true
          })
        }
      },
      cancelAllDownload() {
        MessageBox.confirm('删除任务后无法恢复, 确定吗?').then(async () => {
          Indicator.open()
          const ids = [
            ...this.globals.downloading.map(item => item.LastID),
            ...this.globals.pending_download.map(item => item.LastID)
          ]
          let body
          for (let i = 0; i < ids.length; i++) {
            do {
              await utils.sleep()
              body = await $axios.get(`download?method=cancel&id=${ids[i]}`).catch(this.error)
            } while (body.data.code !== 0)
            await utils.sleep()
          }
          Indicator.close()
        }).catch(() => {})
      },
      cancelAllUpload() {
        MessageBox.confirm('删除任务后无法恢复, 确定吗?').then(async () => {
          Indicator.open()
          const ids = [
            ...this.globals.uploading.map(item => item.LastID),
            ...this.globals.pending_upload.map(item => item.LastID)
          ]
          let body
          for (let i = 0; i < ids.length; i++) {
            do {
              await utils.sleep()
              body = await $axios.get(`upload?method=cancel&id=${ids[i]}`).catch(this.error)
            } while (body.data.code !== 0)
            await utils.sleep()
          }
          Indicator.close()
        }).catch(() => {
        })
      }
    },
    created() {
      this.initWebSocket()
    }
  }
</script>