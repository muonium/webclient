<template>
  <div id="box" :style="style" v-if="opened">
    <div v-if="type === 0">
      <p @click="trigger('FolderAdd')">
        <i class="fa fa-folder-o" aria-hidden="true"></i> {{ $t('RightClick.nFolder') }}
      </p>
      <p @click="trigger('UploadDialog')">
        <i class="fa fa-upload" aria-hidden="true"></i> {{ $t('RightClick.upFiles') }}
      </p>
      <div v-if="hasElToMove()">
        <hr>
        <p @click="move.paste()">
          <i class="fa fa-clipboard" aria-hidden="true"></i> {{ $t('RightClick.paste') }}
        </p>
      </div>
    </div>

    <div v-if="type === 1">
      <p @click="trigger('SelectionDl', id)">
        <i class="fa fa-download" aria-hidden="true"></i> {{ $t('RightClick.dl') }}
      </p>
      <div v-if="isShared()">
        <p @click="share.unshare(id)">
          <i class="fa fa-ban" aria-hidden="true"></i> {{ $t('RightClick.unshare') }}
        </p>
      </div>
      <div v-else>
        <p @click="share.share(id)">
          <i class="fa fa-share" aria-hidden="true"></i> {{ $t('RightClick.share') }}
        </p>
      </div>
      <hr>
      <div v-if="!isInTrash()">
        <p class="hide">
          <i class="fa fa-star" aria-hidden="true"></i> {{ $t('RightClick.star') }}
        </p>
        <hr class="hide">
        <p @click="move.cut(id, type)">
          <i class="fa fa-scissors" aria-hidden="true"></i> {{ $t('RightClick.cut') }}
        </p>
        <p @click="move.copy(id, type)">
          <i class="fa fa-clone" aria-hidden="true"></i> {{ $t('RightClick.copy') }}
        </p>
        <p @click="move.toTrash(id, type)">
          <i class="fa fa-trash" aria-hidden="true"></i> {{ $t('RightClick.trash') }}
        </p>
      </div>
      <div v-else>
        <p @click="move.fromTrash(id, type)">
          <i class="fa fa-undo" aria-hidden="true"></i> {{ $t('RightClick.restore') }}
        </p>
        <p @click="rm.rm(id, type)">
          <i class="fa fa-trash" aria-hidden="true"></i> {{ $t('RightClick.rm') }}
        </p>
      </div>
      <div v-if="hasElToMove()">
        <hr>
        <p @click="move.paste()">
          <i class="fa fa-clipboard" aria-hidden="true"></i> {{ $t('RightClick.paste') }}
        </p>
      </div>
      <div v-if="!isInTrash()">
        <hr>
        <p @click="move.rename(id, type)">
          <i class="fa fa-pencil" aria-hidden="true"></i> {{ $t('RightClick.mvItem') }}
        </p>
      </div>
      <hr>
      <p onclick="Files.details(id)">
        <i class="fa fa-info" aria-hidden="true"></i> {{ $t('RightClick.vDetails') }}
      </p>
    </div>

    <div v-if="type === 2">
      <p @click="trigger('FolderOpen', id)">
        <i class="fa fa-folder-open" aria-hidden="true"></i> {{ $t('RightClick.open') }}
      </p>
      <hr>
      <div v-if="!isInTrash()">
        <p @click="move.cut(id, type)">
          <i class="fa fa-scissors" aria-hidden="true"></i> {{ $t('RightClick.cut') }}
        </p>
        <p @click="move.copy(id, type)">
          <i class="fa fa-clone" aria-hidden="true"></i> {{ $t('RightClick.copy') }}
        </p>
        <p @click="move.toTrash(id, type)">
          <i class="fa fa-trash" aria-hidden="true"></i> {{ $t('RightClick.trash') }}
        </p>
      </div>
      <div v-else>
        <p @click="move.fromTrash(id, type)">
          <i class="fa fa-undo" aria-hidden="true"></i> {{ $t('RightClick.restore') }}
        </p>
        <p @click="rm.rm(id, type)">
          <i class="fa fa-trash" aria-hidden="true"></i> {{ $t('RightClick.rm') }}
        </p>
      </div>
      <div v-if="hasElToMove()">
        <hr>
        <p @click="move.paste(id)">
          <i class="fa fa-clipboard" aria-hidden="true"></i> {{ $t('RightClick.paste') }}
        </p>
      </div>
      <div v-if="!isInTrash()">
        <hr>
        <p @click="move.rename(id, type)">
          <i class="fa fa-pencil" aria-hidden="true"></i> {{ $t('RightClick.mvItem') }}
        </p>
      </div>
      <hr>
      <p onclick="Folders.details(id)">
        <i class="fa fa-info" aria-hidden="true"></i> {{ $t('RightClick.vDetails') }}
      </p>
    </div>
  </div>
</template>

<script>
import store from '../store'
import bus from '../bus'
import move from '../move'
import rm from '../rm'
import share from '../share'

export default {
  name: 'box',
  data () {
    return {
      opened: false,
      type: 0, // 1: file, 2: folder, 0: somewhere else
      id: null,
      css: {
        top: '0px',
        left: '0px',
        visibility: 'visible'
      }
    }
  },
  methods: {
    open (id, type, e) {
      this.id = id
      this.type = parseInt(type)
      if (type === 1) {
        if (store.selection.files.indexOf(id) === -1) {
          bus.$emit('SelectionAddFile', id, null)
        }
      } else if (type === 2) {
        if (store.selection.folders.indexOf(id) === -1) {
          bus.$emit('SelectionAddFolder', id, null)
        }
      }
      this.opened = true
      // We need to make Box 'visible' in order to calculate overflow
      this.css.visibility = 'hidden'

      this.$nextTick(() => {
        // Once DOM updated, calculate position
        let x = e.clientX
        let y = e.clientY
        let el = document.querySelector('#box')
        let headerHeight = document.querySelector('header').offsetHeight

        if (x < 5) x = 5
        if (x + el.clientWidth > document.body.clientWidth - 5) x = document.body.clientWidth - el.clientWidth - 5
        if (y < headerHeight + 5) y = headerHeight + 5
        if (y + el.clientHeight > document.body.clientHeight - 5) y = document.body.clientHeight - el.clientHeight - 5

        this.css.top = y + 'px'
        this.css.left = x + 'px'
        this.css.visibility = 'visible'
        this.css.transform = 'none'
      })
    },
    close () {
      this.type = 0
      this.opened = false
    },
    isInTrash () {
      return store.folder.trash
    },
    hasElToMove () {
      return store.move.files.length > 0 || store.move.folders.length > 0
    },
    isShared () {
      if (this.type !== 0 && this.id !== null) {
        let el = document.querySelector('#' + (this.type === 1 ? 'f' : 'd') + this.id)
        if (el !== null && el.getAttribute('data-shared') === '1') {
          return true
        }
      }
      return false
    },
    trigger (event) {
      bus.$emit.apply(bus, arguments)
    }
  },
  computed: {
    style () {
      return this.css
    },
    move () {
      return move
    },
    rm () {
      return rm
    },
    share () {
      return share
    }
  },
  created () {
    bus.$on('BoxOpen', (id, type, e) => this.open(id, type, e))
    bus.$on('BoxClose', this.close)
    document.addEventListener('click', this.close)
    move.vue = this
    rm.vue = this
    share.vue = this
  },
  beforeDestroy () {
    bus.$off('BoxOpen')
    bus.$off('BoxClose')
    document.removeEventListener('click', this.close)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
<style src="../assets/css/Interface/box.css"></style>
