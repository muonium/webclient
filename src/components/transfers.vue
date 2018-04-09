<template>
  <transition name="fade">
    <div id="transfers" v-if="isOpened">
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
          <li @click="showUp()" :class="this.shared.upSelected ? 'selected' : ''">
            {{ $t('Transfers.uploading') }}
          </li>
          <li @click="showDl()" :class="this.shared.upSelected ? '' : 'selected'">
            {{ $t('Transfers.downloading') }}
          </li>
        </ul>
      </section>

      <section class="content" v-show="!this.minimized">
        <div class="transfers_upload" v-if="this.shared.upSelected">
          <template v-if="this.shared.upload.length > 0">
            <div :id="'div_upload' + index" v-for="(file, index) in this.shared.upload" :key="'upload-' + index" v-if="file">
              <i :data-id="index" class="fa fa-times-circle-o btn-abort" aria-hidden="true" @click="abort('upload', index)"></i>
              <div :class="file.error ? 'transfers_error' : ''">
                <span class="fileinfo">
                  <img :src="$root.$children[0].base + 'static/img/desktop/extensions/' + getIcon(file.name) + '.svg'" class="icon">
                  {{ file.name }}
                </span>
                <span class="pct">{{ file.pct }}%</span>
                <progressBar :pct="file.pct"/>
              </div>
            </div>
          </template>
          <template v-else>
            {{ $t('Transfers.nothing') }}
          </template>
        </div>
        <div class="transfers_download" v-else>
          <template v-if="this.shared.download.length > 0">
            <div :id="'div_download'+ index" v-for="(file, index) in this.shared.download" :key="'download-' + index" v-if="file">
              <i :data-id="index" class="fa fa-times-circle-o btn-abort" aria-hidden="true" @click="abort('download', index)"></i>
              <div :class="file.error ? 'transfers_error' : ''">
                <span class="fileinfo">
                  <img :src="$root.$children[0].base + 'static/img/desktop/extensions/' + getIcon(file.name) + '.svg'" class="icon">
                  {{ file.name }}
                </span>
                <span class="pct">{{ file.pct }}%</span>
                <progressBar :pct="file.pct"/>
              </div>
            </div>
          </template>
          <template v-else>
            {{ $t('Transfers.nothing') }}
          </template>
        </div>
      </section>
    </div>
  </transition>
</template>

<script>
import store from '../store'
import bus from '../bus'
import upload from '../upload'
import download from '../download'
import extIcons from '../extIcons'
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
      shared: store.transfers
    }
  },
  methods: {
    close () {
      bus.$emit('SidebarCloseTransfers')
      store.folder.transfers = false
    },
    minimize () {
      this.minimized = !this.minimized
    },
    showUp () {
      this.shared.upSelected = true
    },
    showDl () {
      this.shared.upSelected = false
    },
    getIcon (filename) {
      return extIcons.get(filename)
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
  computed: {
    isOpened () {
      return store.folder.transfers
    }
  },
  created () {
    if (typeof this.show !== 'undefined' && this.show === 'download') {
      this.shared.upSelected = false
    }
    bus.$on('TransfersSetError', (type, id, msg) => this.setError(type, id, msg))
  },
  beforeDestroy () {
    bus.$off('TransfersSetError')
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .4s;
}
.fade-enter, .fade-leave-to {
  transition: opacity .2s;
  opacity: 0;
}
</style>
<style src="../assets/css/2018/transfers.css"></style>
