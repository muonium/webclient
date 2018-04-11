<template>
  <transition name="fade">
    <div id="box" :style="style" v-if="opened">
      <div v-if="type === 0">
        <p @click="trigger('FolderAdd')">
          <i class="fa fa-folder-o" aria-hidden="true"></i> {{ $t('Selection.nFolder') }}
        </p>
        <p @click="trigger('UploadDialog')">
          <i class="fa fa-upload" aria-hidden="true"></i> {{ $t('Selection.upFiles') }}
        </p>
        <div v-if="hasElToMove()">
          <hr>
          <p @click="move.paste()">
            <i class="fa fa-clipboard" aria-hidden="true"></i> {{ $t('Selection.paste') }}
          </p>
        </div>
      </div>

      <div v-if="!details && type === 1">
        <p @click="trigger('SelectionDl', id)">
          <i class="fa fa-download" aria-hidden="true"></i> {{ $t('Selection.dl') }}
        </p>
        <div v-if="isShared()">
          <p @click="share.unshare(id)">
            <i class="fa fa-ban" aria-hidden="true"></i> {{ $t('Selection.unshare') }}
          </p>
        </div>
        <div v-else>
          <p @click="share.share(id)">
            <i class="fa fa-share" aria-hidden="true"></i> {{ $t('Selection.share') }}
          </p>
        </div>
        <hr>
        <div v-if="!isInTrash()">
          <p class="hide">
            <i class="fa fa-star" aria-hidden="true"></i> {{ $t('Selection.star') }}
          </p>
          <hr class="hide">
          <p @click="move.cut(id, type)">
            <i class="fa fa-scissors" aria-hidden="true"></i> {{ $t('Selection.cut') }}
          </p>
          <p @click="move.copy(id, type)">
            <i class="fa fa-clone" aria-hidden="true"></i> {{ $t('Selection.copy') }}
          </p>
          <p @click="move.toTrash(id, type)">
            <i class="fa fa-trash" aria-hidden="true"></i> {{ $t('Selection.trash') }}
          </p>
        </div>
        <div v-else>
          <p @click="move.fromTrash(id, type)">
            <i class="fa fa-undo" aria-hidden="true"></i> {{ $t('Selection.restore') }}
          </p>
          <p @click="rm.rm(id, type)">
            <i class="fa fa-trash" aria-hidden="true"></i> {{ $t('Selection.rm') }}
          </p>
        </div>
        <div v-if="hasElToMove()">
          <hr>
          <p @click="move.paste()">
            <i class="fa fa-clipboard" aria-hidden="true"></i> {{ $t('Selection.paste') }}
          </p>
        </div>
        <div v-if="!isInTrash()">
          <hr>
          <p @click="move.rename(id, type)">
            <i class="fa fa-pencil" aria-hidden="true"></i> {{ $t('Selection.mvItem') }}
          </p>
        </div>
        <hr>
        <p @click.stop="toggleDetails()">
          <i class="fa fa-info" aria-hidden="true"></i> {{ $t('Selection.vDetails') }}
        </p>
      </div>

      <div v-if="!details && type === 2">
        <p @click="trigger('FolderOpen', id)">
          <i class="fa fa-folder-open" aria-hidden="true"></i> {{ $t('Selection.open') }}
        </p>
        <hr>
        <div v-if="!isInTrash()">
          <p @click="move.cut(id, type)">
            <i class="fa fa-scissors" aria-hidden="true"></i> {{ $t('Selection.cut') }}
          </p>
          <p @click="move.copy(id, type)">
            <i class="fa fa-clone" aria-hidden="true"></i> {{ $t('Selection.copy') }}
          </p>
          <p @click="move.toTrash(id, type)">
            <i class="fa fa-trash" aria-hidden="true"></i> {{ $t('Selection.trash') }}
          </p>
        </div>
        <div v-else>
          <p @click="move.fromTrash(id, type)">
            <i class="fa fa-undo" aria-hidden="true"></i> {{ $t('Selection.restore') }}
          </p>
          <p @click="rm.rm(id, type)">
            <i class="fa fa-trash" aria-hidden="true"></i> {{ $t('Selection.rm') }}
          </p>
        </div>
        <div v-if="hasElToMove()">
          <hr>
          <p @click="move.paste(id)">
            <i class="fa fa-clipboard" aria-hidden="true"></i> {{ $t('Selection.paste') }}
          </p>
        </div>
        <div v-if="!isInTrash()">
          <hr>
          <p @click="move.rename(id, type)">
            <i class="fa fa-pencil" aria-hidden="true"></i> {{ $t('Selection.mvItem') }}
          </p>
        </div>
        <hr>
        <p @click.stop="toggleDetails()">
          <i class="fa fa-info" aria-hidden="true"></i> {{ $t('Selection.vDetails') }}
        </p>
      </div>

      <div v-if="details && type === 1">
        <div class="close" @click="close()">x</div>
        <div class="details">
          <strong>{{ $t('Tree.details') }}</strong>
          <ul>
            <li><span class="label">{{ $t('Tree.name') }}:</span> {{ utils.htmlspecialcharsDecode(el.getAttribute('data-title')) }}</li>
            <li><span class="label">{{ $t('Tree.path') }}:</span> {{ utils.htmlspecialcharsDecode(el.getAttribute('data-path')) }}/</li>
            <li><span class="label">{{ $t('Tree.type') }}:</span> {{ $t('Selection.file') }}</li>
            <li><span class="label">{{ $t('Tree.size') }}:</span> {{ el.querySelector('.file_size').textContent }}</li>
            <li><span class="label">{{ $t('Tree.lastmod') }}:</span> {{ el.querySelector('.file_lastmod').textContent }}</li>
          </ul>
          <p>
            <a class="mono blue" @click="trigger('SelectionDl', id)">
              <i class="fa fa-download" aria-hidden="true"></i> {{ $t('Selection.dl') }}
            </a>
          </p>
          <p v-if="isShared()">
            <a class="mono blue" @click="share.unshare(id)">
              <i class="fa fa-ban" aria-hidden="true"></i> {{ $t('Selection.unshare') }}
            </a>
          </p>
          <p v-if="isShared()">
            <a class="blue block" @click="copyUrl()">
              <i class="fa fa-link"></i> {{ $t('Selection.copyLink') }}
            </a>
            <input type="text" :value="this.el.getAttribute('data-url')" class="copy_url">
          </p>
          <p v-else>
            <a class="mono blue" @click="share.share(id)">
              <i class="fa fa-share" aria-hidden="true"></i> {{ $t('Selection.share') }}
            </a>
          </p>
        </div>
      </div>

      <div v-if="details && type === 2">
        <div class="close" @click="close()">x</div>
        <div class="details">
          <strong>{{ $t('Tree.details') }}</strong>
          <ul>
            <li><span class="label">{{ $t('Tree.name') }}:</span> {{ utils.htmlspecialcharsDecode(el.getAttribute('data-title')) }}</li>
            <li><span class="label">{{ $t('Tree.path') }}:</span> {{ utils.htmlspecialcharsDecode(el.getAttribute('data-path')) }}/</li>
            <li><span class="label">{{ $t('Tree.type') }}:</span> {{ $t('Selection.folder') }}</li>
            <li><span class="label">{{ $t('Tree.size') }}:</span> {{ el.getAttribute('title') }}</li>
          </ul>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import store from '../store'
import bus from '../bus'
import utils from '../utils'
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
      el: null,
      details: false,
      css: {
        top: '0px',
        left: '0px',
        visibility: 'visible'
      }
    }
  },
  methods: {
    open (id, type, e, details = false) {
      this.id = id
      this.type = parseInt(type)
      if (type === 1) {
        this.el = document.querySelector('#f' + id)
        if (store.selection.files.indexOf(id) === -1) {
          bus.$emit('SelectionAddFile', id, null)
        }
      } else if (type === 2) {
        this.el = document.querySelector('#d' + id)
        if (store.selection.folders.indexOf(id) === -1) {
          bus.$emit('SelectionAddFolder', id, null)
        }
      }
      this.details = details
      if (this.details) {
        document.removeEventListener('click', this.close)
      }
      this.opened = true
      // We need to make Box 'visible' in order to calculate overflow
      this.css.visibility = 'hidden'

      this.$nextTick(() => {
        // Once DOM updated, calculate position
        if (e) {
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
          this.css.transform = 'none'
        } else {
          this.css.top = null
          this.css.left = null
          this.css.transform = null
        }
        this.css.visibility = 'visible'
      })
    },
    close () {
      this.type = 0
      this.details = false
      this.opened = false
    },
    toggleDetails () {
      if (this.el === null) return false
      this.details = !this.details
      if (this.details) {
        document.removeEventListener('click', this.close)
      } else {
        document.addEventListener('click', this.close)
      }
    },
    copyUrl () {
      document.querySelector('#box .copy_url').select()
      document.execCommand('copy')
    },
    isInTrash () {
      return store.folder.trash
    },
    hasElToMove () {
      return store.move.files.length > 0 || store.move.folders.length > 0
    },
    isShared () {
      if (this.type !== 0 && this.id !== null) {
        if (this.el !== null && this.el.getAttribute('data-shared') === '1') {
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
    utils () {
      return utils
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
    bus.$on('BoxOpen', (id, type, e, details) => this.open(id, type, e, details))
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
<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .4s;
}
.fade-enter, .fade-leave-to {
  transition: opacity .2s;
  opacity: 0;
}
</style>
<style src="../assets/css/Interface/box.css"></style>
