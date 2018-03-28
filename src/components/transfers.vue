<template>
  <div id="transfers" v-if="isOpened()">
    <section class="top">
      {{ $t('Global.transfers') }}
      <span @click="close()">
        <i class="fa fa-times" aria-hidden="true"></i>
      </span>
      <span @click="minimize()">
        <i class="fa fa-window-minimize" aria-hidden="true"></i>
      </span>
    </section>

    <section class="toggle" v-show="!this.minimized">
      <ul>
        <li @click="showUp()" :class="this.upSelected ? 'selected' : ''">
          {{ $t('User.uploading') }}
        </li>
        <li @click="showDl()" :class="this.upSelected ? '' : 'selected'">
          {{ $t('User.downloading') }}
        </li>
      </ul>
    </section>

    <section class="content" v-show="!this.minimized">
      <div class="transfers_upload" v-if="this.upSelected">
        <div v-if="this.shared.upload.length > 0">
          <div :id="'div_upload' + index" v-for="(file, index) in this.shared.upload" :key="'upload-' + index" v-if="file">
            <i :data-id="index" class="fa fa-times-circle-o btn-abort" aria-hidden="true" @click="abort('upload', index)"></i>
            <div :class="file.error ? 'transfers_error' : ''">
              <span class="fileinfo">{{ file.name }}</span>
              <span class="pct">{{ file.pct }}%</span>
              <progressBar :pct="file.pct"/>
            </div>
          </div>
        </div>
        <div v-else>
          {{ $t('User.nothing') }}
        </div>
      </div>
      <div class="transfers_download" v-else>
        <div v-if="this.shared.download.length > 0">
          <div :id="'div_download'+ index" v-for="(file, index) in this.shared.download" :key="'download-' + index" v-if="file">
            <i :data-id="index" class="fa fa-times-circle-o btn-abort" aria-hidden="true" @click="abort('download', index)"></i>
            <div :class="file.error ? 'transfers_error' : ''">
              <span class="fileinfo">{{ file.name }}</span>
              <span class="pct">{{ file.pct }}%</span>
              <progressBar :pct="file.pct"/>
            </div>
          </div>
        </div>
        <div v-else>
          {{ $t('User.nothing') }}
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import store from '../store'
import bus from '../bus'
import upload from '../upload'
import download from '../download'
import progressBar from './progress_bar'

export default {
  name: 'transfers',
  props: {
    show: {
      type: String,
      required: false
    }
  },
  components: {
    progressBar
  },
  data () {
    return {
      minimized: false,
      upSelected: true,
      shared: store.transfers
    }
  },
  methods: {
    isOpened () {
      return store.folder.transfers
    },
    close () {
      bus.$emit('SidebarCloseTransfers')
      store.folder.transfers = false
    },
    minimize () {
      this.minimized = !this.minimized
    },
    showUp () {
      this.upSelected = true
    },
    showDl () {
      this.upSelected = false
    },
    setError (type, id, msg = null) {
      if ((type === 'upload' || type === 'download') && typeof this.shared[type][id] !== 'undefined') {
        let row = this.shared[type][id]
        row.error = true
        row.error_msg = msg
        this.$set(this.shared[type], id, row)
      }
    },
    abort (type, id) {
      if (type !== 'upload' && type !== 'download') return false
      if (type === 'upload') {
        upload.abort(id)
      } else if (type === 'download') {
        download.abort(id)
      }
    }
  },
  created () {
    if (typeof this.show !== 'undefined' && this.show === 'download') {
      this.upSelected = false
    }
    bus.$on('TransfersSetError', (type, id, msg) => this.setError(type, id, msg))
  },
  beforeDestroy () {
    bus.$off('TransfersSetError')
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
<style src="../assets/css/2018/transfers.css"></style>
