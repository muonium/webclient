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

    <section class="toggle">
      <ul>
        <li @click="showUp()" :class="this.upSelected ? 'selected' : ''">
          {{ $t('User.uploading') }}
        </li>
        <li @click="showDl()" :class="this.upSelected ? '' : 'selected'">
          {{ $t('User.downloading') }}
        </li>
      </ul>
    </section>

    <section class="content">
      <div class="transfers_upload" v-if="this.upSelected">
        {{ $t('User.nothing') }}
      </div>
      <div class="transfers_download" v-else>
        {{ $t('User.nothing') }}
      </div>
    </section>
  </div>
</template>

<script>
import store from '../store'
import bus from '../bus'

export default {
  name: 'transfers',
  data () {
    return {
      upSelected: true
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
      //
    },
    showUp () {
      this.upSelected = true
    },
    showDl () {
      this.upSelected = false
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
<style src="../assets/css/2018/transfers.css"></style>
