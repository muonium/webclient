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
          <div :id="'div_upload' + file.id" v-for="file in this.shared.upload" :key="file.id">
            <i :data-id="file.id" class="fa fa-times-circle-o btn-abort" aria-hidden="true" @click="abort('upload', file.id)"></i>
            <div>
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
          <div :id="'div_download'+ file.id" v-for="file in this.shared.download" :key="file.id">
            <i :data-id="file.id" class="fa fa-times-circle-o btn-abort" aria-hidden="true" @click="abort('download', file.id)"></i>
            <div>
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
import progressBar from './progress_bar'

export default {
  name: 'transfers',
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
    abort (type, id) {
      if (type !== 'upload' && type !== 'download') {
        return false
      }
      let file = this.shared[type].find(f => f.id === parseInt(id))
      let index = this.shared[type].indexOf(file)
      if (file !== undefined && index !== -1) {
        this.$delete(this.shared[type], index)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
<style src="../assets/css/2018/transfers.css"></style>
