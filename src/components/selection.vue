<template>
  <div id="selection">
    <div class="fixed">
      <section class="selection">
        <button id="up_btn" class="btn btn-large mbottom" onclick="Upload.dialog()">{{ $t('RightClick.upFiles') }}</button>

        <a href="#" id="up_icon" class="blue block" onclick="Upload.dialog(event)" :title="$t('RightClick.upFiles')">
          <i class="fa fa-upload" aria-hidden="true"></i>
        </a>

        <a href="#" id="create_btn" class="blue block" @click="trigger('FolderAdd')" :title="$t('RightClick.nFolder')">
          <i class="fa fa-folder-o" aria-hidden="true"></i> {{ $t('RightClick.nFolder') }}
        </a>

        <!-- Selection infos will be displayed there -->
      </section>

      <!-- Box -->

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

      <div id="quota_container"></div>

      <p class="center">
        <router-link to="/upgrade" class="mono">{{ $t('Profile.getmore') }}</router-link>
      </p>

      <div class="selection_bottom">
        <!--<a href="#" class="btn btn-actions"></a>-->
        <!--<a href="#" class="mono up">Privacy</a>-->
      </div>
    </div>
  </div>
</template>

<script>
import bus from '../bus'

export default {
  name: 'selection',
  data () {
    return {
      files: [],
      folders: [],
      multiple: false
    }
  },
  methods: {
    addFile (id, e) {
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
          let pos = this.files.indexOf(id)
          if (pos === -1) {
            this.files.push(id)
            this.addSelected('f' + id)
          } else {
            this.removeFile(id)
          }
        } else {
          // Single selection
          this.removeAll()
          this.files.push(id)
          this.addSelected('f' + id)
        }
      }
    },
    addFolder (id, e) {
      // Called when a folder is clicked, try to add it to selection (or remove it)
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

      if (document.querySelector('#d' + id)) {
        if (this.multiple || (e !== null && (e === 'ctrl' || e.ctrlKey))) {
          // Multiple selection
          let pos = this.folders.indexOf(id)
          if (pos === -1) {
            this.folders.push(id)
            this.addSelected('d' + id)
          } else {
            this.removeFolder(id)
          }
        } else {
          // Single selection
          this.removeAll()
          this.folders.push(id)
          this.addSelected('d' + id)
        }
      }
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
    addAll () {
      // Select all files/folders
      let files = document.querySelectorAll('#mui .file')
      let folders = document.querySelectorAll('#mui .folder')
      for (let i = 0; i < files.length; i++) {
        let id = parseInt(files[i].id.substr(1))
        if (!isNaN(id) && this.files.indexOf(id) === -1) {
          this.addFile(id, 'ctrl')
        }
      }
      for (let j = 0; j < folders.length; j++) {
        let id = parseInt(folders[j].id.substr(1))
        if (!isNaN(id) && this.folders.indexOf(id) === -1) {
          this.addFolder(id, 'ctrl')
        }
      }
      document.querySelector('#sel_all').checked = true
    },
    removeFile (id) {
      // Remove a file from selection
      id = parseInt(id)
      if (isNaN(id)) return false
      let pos = this.files.indexOf(id)
      if (pos !== -1) {
        this.$delete(this.files, pos)
        this.removeSelected('f' + id)
      }
    },
    removeFolder (id) {
      // Remove a folder from selection
      id = parseInt(id)
      if (isNaN(id)) return false
      let pos = this.folders.indexOf(id)
      if (pos !== -1) {
        this.$delete(this.folders, pos)
        this.removeSelected('d' + id)
      }
    },
    removeFiles () {
      // Remove selected files from selection
      for (let file of this.files) {
        this.removeSelected('f' + file)
      }
      this.files = []
    },
    removeFolders () {
      // Remove selected folders from selection
      for (let folder of this.folders) {
        this.removeSelected('d' + folder)
      }
      this.folders = []
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
    removeAll () {
      // Remove selected files/folders from selection
      this.removeFiles()
      this.removeFolders()
    },
    invert () {
      // Invert selection
      let files = document.querySelectorAll('#mui .file')
      let folders = document.querySelectorAll('#mui .folder')
      for (let i = 0; i < files.length; i++) {
        this.addFile(files[i].id.substr(1), 'ctrl')
      }
      for (let j = 0; j < folders.length; j++) {
        this.addFolder(folders[j].id.substr(1), 'ctrl')
      }
    },
    trigger (event) {
      bus.$emit.apply(bus, arguments)
    }
  },
  created () {
    bus.$on('SelectionAddFile', (id, e) => this.addFile(id, e))
    bus.$on('SelectionAddFolder', (id, e) => this.addFolder(id, e))
    bus.$on('SelectionAddAll', this.addAll)
    bus.$on('SelectionRemoveAll', this.removeAll)
    bus.$on('SelectionInvert', this.invert)
  },
  beforeDestroy () {
    bus.$off('SelectionAddFile')
    bus.$off('SelectionAddFolder')
    bus.$off('SelectionAddAll')
    bus.$off('SelectionRemoveAll')
    bus.$off('SelectionInvert')
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
<style src="../assets/css/2018/selection.css"></style>
