<template>
  <div id="selection">
    <div class="fixed">
      <section class="selection" ref="container">
        <button id="up_btn" class="btn btn-large mbottom" @click.prevent="trigger('UploadDialog')">{{ $t('Selection.upFiles') }}</button>

        <a href="#" id="up_icon" class="blue block" @click.prevent="trigger('UploadDialog')" :title="$t('Selection.upFiles')">
          <i class="fa fa-upload" aria-hidden="true"></i>
        </a>

        <a href="#" id="create_btn" class="blue block" @click="trigger('FolderAdd')" :title="$t('Selection.nFolder')">
          <i class="fa fa-folder-o" aria-hidden="true"></i> {{ $t('Selection.nFolder') }}
        </a>

        <!-- Selection infos -->
        <template v-if="this.fileEl && this.fileId">
          <strong>{{ $t('Selection.actions') }}</strong>
          <a class="blue block" @click="trigger('SelectionDl', fileId)" :title="$t('Selection.dl')">
            <i class="fa fa-download" aria-hidden="true"></i> {{ $t('Selection.dl') }}
          </a>
          <template v-if="!isInTrash()">
            <a class="blue block" @click="move.cut(fileId, 1)" :title="$t('Selection.cut')">
              <i class="fa fa-scissors" aria-hidden="true"></i> {{ $t('Selection.cut') }}
            </a>
            <a class="blue block" @click="move.copy(fileId, 1)" :title="$t('Selection.copy')">
              <i class="fa fa-clone" aria-hidden="true"></i> {{ $t('Selection.copy') }}
            </a>
            <a class="blue block" @click="move.toTrash(fileId, 1)" :title="$t('Selection.trash')">
              <i class="fa fa-trash" aria-hidden="true"></i> {{ $t('Selection.trash') }}
            </a>
          </template>
          <template v-else>
            <a class="blue block" @click="move.fromTrash(fileId, 1)" :title="$t('Selection.restore')">
              <i class="fa fa-undo" aria-hidden="true"></i> {{ $t('Selection.restore') }}
            </a>
            <a class="blue block" @click="rm.rm(fileId, 1)" :title="$t('Selection.rm')">
              <i class="fa fa-trash" aria-hidden="true"></i> {{ $t('Selection.rm') }}
            </a>
          </template>
          <a v-if="!isInTrash() && shared.files.length === 1 && shared.folders.length === 0" class="blue block" @click="move.rename(fileId, 1)" :title="$t('Selection.mvItem')">
            <i class="fa fa-pencil" aria-hidden="true"></i> {{ $t('Selection.mvItem') }}
          </a>
          <a v-if="shared.files.length === 1 && shared.folders.length === 0" class="blue block" @click="trigger('BoxOpen', fileId, 1, null, true)" :title="$t('Selection.vDetails')">
            <i class="fa fa-info" aria-hidden="true"></i> {{ $t('Selection.vDetails') }}
          </a>
          <template v-if="shared.files.length > 1 || shared.folders.length > 1 || isShared()">
            <a class="blue block share-link" @click="share.unshare(fileId)" :title="$t('Selection.unshare')">
              <i class="fa fa-ban" aria-hidden="true"></i> {{ $t('Selection.unshare') }}
            </a>
            <template v-if="shared.files.length === 1 && shared.folders.length === 0">
              <input type="text" :value="fileEl.getAttribute('data-url')" class="copy_url">
              <input id="copy_btn" type="button" class="btn btn-large" :value="$t('Selection.copyLink')" @click="copyUrl()">
              <a id="copy_icon" class="blue block" @click="copyUrl()" :title="$t('Selection.copyLink')">
                <i class="fa fa-link"></i>
              </a>
            </template>
          </template>
          <template v-if="shared.files.length > 1 || shared.folders.length > 1 || !isShared()">
            <a class="blue block share-link" @click="share.share(fileId)" :title="$t('Selection.share')">
              <i class="fa fa-share" aria-hidden="true"></i> {{ $t('Selection.share') }}
            </a>
          </template>
        </template>

        <template v-if="this.folderEl">
          <template v-if="shared.files.length === 0 && shared.folders.length === 1">
            <a class="blue block" @click="trigger('FolderOpen', folderId)" :title="$t('Selection.open')">
              <i class="fa fa-folder-open" aria-hidden="true"></i> {{ $t('Selection.open') }}
            </a>
          </template>
          <template v-if="!isInTrash()">
            <a class="blue block" @click="move.cut(folderId, 2)" :title="$t('Selection.cut')">
              <i class="fa fa-scissors" aria-hidden="true"></i> {{ $t('Selection.cut') }}
            </a>
            <a class="blue block" @click="move.copy(folderId, 2)" :title="$t('Selection.copy')">
              <i class="fa fa-clone" aria-hidden="true"></i> {{ $t('Selection.copy') }}
            </a>
            <a class="blue block" @click="move.toTrash(folderId, 2)" :title="$t('Selection.trash')">
              <i class="fa fa-trash" aria-hidden="true"></i> {{ $t('Selection.trash') }}
            </a>
          </template>
          <template v-else>
            <a class="blue block" @click="move.fromTrash(folderId, 2)" :title="$t('Selection.restore')">
              <i class="fa fa-undo" aria-hidden="true"></i> {{ $t('Selection.restore') }}
            </a>
            <a class="blue block" @click="rm.rm(folderId, 2)" :title="$t('Selection.rm')">
              <i class="fa fa-trash" aria-hidden="true"></i> {{ $t('Selection.rm') }}
            </a>
          </template>
          <a v-if="!isInTrash() && shared.files.length === 0 && shared.folders.length === 1" class="blue block" @click="move.rename(folderId, 2)" :title="$t('Selection.mvItem')">
            <i class="fa fa-pencil" aria-hidden="true"></i> {{ $t('Selection.mvItem') }}
          </a>
          <a v-if="shared.files.length === 0 && shared.folders.length === 1" class="blue block" @click="trigger('BoxOpen', folderId, 2, null, true)" :title="$t('Selection.vDetails')">
            <i class="fa fa-info" aria-hidden="true"></i> {{ $t('Selection.vDetails') }}
          </a>
        </template>
      </section>

      <div class="story">
        <p class="mono keep">
          <strong v-html="$t('Story.keep')"></strong>
        </p>
        <hr>
        <p class="join">{{ $t('Story.join') }}</p>
        <!--<p><a href="#">{{ $t('Story.read') }}</a></p>-->
        <p>
          <router-link to="/upgrade" class="btn btn-large btn-b">{{ $t('Story.premium') }}</router-link>
        </p>
        <p>
          <a href="https://muonium.io/#!/donate" target="_blank" class="btn btn-large btn-c">{{ $t('Story.donate') }}</a>
        </p>
        <!--<p class="help"><a href="#">{{ $t('Story.help') }}</a></p>-->
      </div>

      <div id="quota_container">
        <progressBar :pct="pct"/>
        <span v-html="quota_html"></span> - {{ pct }}%
      </div>

      <p class="center">
        <router-link to="/upgrade" class="mono">{{ $t('Profile.getMore') }}</router-link>
      </p>

      <div class="selection_bottom">
        <!--<a href="#" class="btn btn-actions"></a>-->
        <!--<a href="#" class="mono up">Privacy</a>-->
      </div>
    </div>
  </div>
</template>

<script>
import store from '../store'
import bus from '../bus'
import move from '../move'
import rm from '../rm'
import share from '../share'
import download from '../download'
import progressBar from './progress_bar'
import utils from '../utils'
import slide from '../slide'

export default {
  name: 'selection',
  mixins: [slide],
  components: {
    progressBar
  },
  data () {
    return {
      shared: store.selection,
      multiple: false,
      fileEl: null,
      folderEl: null,
      fileId: null,
      folderId: null
    }
  },
  methods: {
    addFile (id, e, putActions = false) {
      // Called when a file is clicked, try to add it to selection (or remove it)
      id = parseInt(id)
      if (isNaN(id)) return false
      if (typeof e === 'object' && e !== null) {
        if (e.target.classList.contains('btn-actions')) {
          return false
        }
        if (e.target.tagName === 'LABEL' || (e.target.tagName === 'TD' && e.target.classList.contains('file_checkbox'))) {
          e = 'ctrl' // Click on label/checkbox: behave like 'ctrl' key is pressed
        }
      }

      if (document.querySelector('#f' + id)) {
        if (this.multiple || (e !== null && (e === 'ctrl' || e.ctrlKey))) {
          // Multiple selection
          let pos = this.shared.files.indexOf(id)
          if (pos === -1) {
            this.shared.files.push(id)
            this.addSelected('f' + id)
          } else {
            this.removeFile(id)
          }
        } else {
          // Single selection
          this.removeAll()
          this.shared.files.push(id)
          this.addSelected('f' + id)
        }
      }
      if (putActions) this.putActions()
    },
    addFolder (id, e, putActions = false) {
      // Called when a folder is clicked, try to add it to selection (or remove it)
      id = parseInt(id)
      if (isNaN(id)) return false
      if (typeof e === 'object' && e !== null) {
        if (e.target.classList.contains('btn-actions')) {
          return false
        }
        if (e.target.tagName === 'LABEL' || (e.target.tagName === 'TD' && e.target.classList.contains('folder_checkbox'))) {
          e = 'ctrl' // Click on label/checkbox: behave like 'ctrl' key is pressed
        }
      }

      if (document.querySelector('#d' + id)) {
        if (this.multiple || (e !== null && (e === 'ctrl' || e.ctrlKey))) {
          // Multiple selection
          let pos = this.shared.folders.indexOf(id)
          if (pos === -1) {
            this.shared.folders.push(id)
            this.addSelected('d' + id)
          } else {
            this.removeFolder(id)
          }
        } else {
          // Single selection
          this.removeAll()
          this.shared.folders.push(id)
          this.addSelected('d' + id)
        }
      }
      if (putActions) this.putActions()
    },
    addSelected (id) {
      // Add "selected" class to a file/folder
      let el = document.querySelector('#' + id)
      if (el) {
        el.classList.add('selected')
        el.querySelector('#sel_' + id).checked = true
        document.querySelector('#sel_all').checked = false
      }
    },
    addAll (putActions = false) {
      // Select all files/folders
      let files = document.querySelectorAll('#mui .file')
      let folders = document.querySelectorAll('#mui .folder')
      for (let i = 0; i < files.length; i++) {
        let id = parseInt(files[i].id.substr(1))
        if (!isNaN(id) && this.shared.files.indexOf(id) === -1) {
          this.addFile(id, 'ctrl')
        }
      }
      for (let j = 0; j < folders.length; j++) {
        let id = parseInt(folders[j].id.substr(1))
        if (!isNaN(id) && this.shared.folders.indexOf(id) === -1) {
          this.addFolder(id, 'ctrl')
        }
      }
      document.querySelector('#sel_all').checked = true
      if (putActions) this.putActions()
    },
    removeFile (id) {
      // Remove a file from selection
      id = parseInt(id)
      if (isNaN(id)) return false
      let pos = this.shared.files.indexOf(id)
      if (pos !== -1) {
        this.$delete(this.shared.files, pos)
        this.removeSelected('f' + id)
      }
    },
    removeFolder (id) {
      // Remove a folder from selection
      id = parseInt(id)
      if (isNaN(id)) return false
      let pos = this.shared.folders.indexOf(id)
      if (pos !== -1) {
        this.$delete(this.shared.folders, pos)
        this.removeSelected('d' + id)
      }
    },
    removeFiles () {
      // Remove selected files from selection
      for (let file of this.shared.files) {
        this.removeSelected('f' + file)
      }
      this.shared.files = []
    },
    removeFolders () {
      // Remove selected folders from selection
      for (let folder of this.shared.folders) {
        this.removeSelected('d' + folder)
      }
      this.shared.folders = []
    },
    removeSelected (id) {
      // Remove selected file/folder from selection
      let el = document.querySelector('#' + id)
      if (el) {
        el.classList.remove('selected')
        el.querySelector('#sel_' + id).checked = false
        document.querySelector('#sel_all').checked = false
      }
    },
    removeAll (putActions = false) {
      // Remove selected files/folders from selection
      this.removeFiles()
      this.removeFolders()
      if (putActions) this.putActions()
    },
    invert (putActions = false) {
      // Invert selection
      let files = document.querySelectorAll('#mui .file')
      let folders = document.querySelectorAll('#mui .folder')
      for (let i = 0; i < files.length; i++) {
        this.addFile(files[i].id.substr(1), 'ctrl')
      }
      for (let j = 0; j < folders.length; j++) {
        this.addFolder(folders[j].id.substr(1), 'ctrl')
      }
      if (putActions) this.putActions()
    },
    dl (id) {
      if (this.shared.files === 0) {
        if (id === undefined) {
          return false
        }
        download.dlFiles([id], this)
      } else {
        download.dlFiles(this.shared.files, this)
      }
    },
    putActions () {
      // Called from events callback which update selection
      if (this.shared.files.length > 0 || this.shared.folders.length > 0) {
        document.querySelector('#selection').classList.add('selected')
        document.querySelector('#mui').classList.add('selected')
        document.querySelector('#display').classList.add('selected')
        if (this.shared.files.length > 0) {
          this.fileEl = document.querySelector('#f' + this.shared.files[this.shared.files.length - 1])
          this.fileId = this.shared.files[this.shared.files.length - 1]
          this.folderEl = null
          this.folderId = null
        } else {
          this.fileEl = null
          this.fileId = null
          this.folderEl = document.querySelector('#d' + this.shared.folders[this.shared.folders.length - 1])
          this.folderId = this.shared.folders[this.shared.folders.length - 1]
        }
      } else {
        document.querySelector('#selection').classList.remove('selected')
        document.querySelector('#mui').classList.remove('selected')
        document.querySelector('#display').classList.remove('selected')
        this.fileEl = null
        this.fileId = null
        this.folderEl = null
        this.folderId = null
      }
    },
    copyUrl () {
      let el = document.querySelector('section.selection .copy_url')
      if (el === null) return false
      let isVisible = (el.currentStyle ? el.currentStyle.display : getComputedStyle(el, null).display) !== 'none'
      if (!isVisible) {
        el.classList.add('cc')
      }
      el.select()
      document.execCommand('copy')
      if (!isVisible) {
        el.classList.remove('cc')
        alert(this.$t('Tree.copied'))
      }
    },
    isInTrash () {
      return store.folder.trash
    },
    isShared () {
      if (this.fileEl !== null && this.fileId !== null) {
        if (this.fileEl.getAttribute('data-shared') === '1') {
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
    pct () {
      let p = store.folder.stored / store.folder.quota * 100
      return isNaN(p) ? 0 : (p > 100 ? 100 : parseFloat(p.toFixed(2)))
    },
    quota_html () {
      return this.$t('Selection.quotaOf')
        .replace('[used]', '<strong>' + utils.showSize(store.folder.stored) + '</strong>')
        .replace('[total]', '<strong>' + utils.showSize(store.folder.quota) + '</strong>')
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
    bus.$on('SelectionAddFile', (id, e) => {
      if (e !== null) bus.$emit('BoxClose')
      this.addFile(id, e, true)
    })
    bus.$on('SelectionAddFolder', (id, e) => {
      if (e !== null) bus.$emit('BoxClose')
      this.addFolder(id, e, true)
    })
    bus.$on('SelectionAddAll', () => this.addAll(true))
    bus.$on('SelectionRemoveAll', () => this.removeAll(true))
    bus.$on('SelectionInvert', () => this.invert(true))
    bus.$on('SelectionDl', (id) => this.dl(id))
  },
  mounted () {
    this.slide(this.$refs.container)
  },
  beforeDestroy () {
    bus.$off('SelectionAddFile')
    bus.$off('SelectionAddFolder')
    bus.$off('SelectionAddAll')
    bus.$off('SelectionRemoveAll')
    bus.$off('SelectionInvert')
    bus.$off('SelectionDl')
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
<style src="../assets/css/2018/selection.css"></style>
