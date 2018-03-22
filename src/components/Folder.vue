<template>
  <div class="container-max"
    @click="trigger('SelectionRemoveAll')"
    @contextmenu="trigger('BoxOpen', null, 0, $event)"
  >
    <vue-headful
      title="Muonium"
    />
    <div id="display">
      <input type="radio" id="display_list" name="display">
      <label for="display_list" class="nomargin"><i class="fa fa-th-list" aria-hidden="true"></i></label>

      <input type="radio" id="display_mosaic" name="display" checked>
      <label for="display_mosaic" class="nomargin"><i class="fa fa-th-large" aria-hidden="true"></i></label>
    </div>

    <section id="desktop">
      <!-- Hidden upload form -->
      <form class="hidden">
        <input type="file" id="upFilesInput" name="files[]" multiple="multiple" class="hide" @change="startUpload($event)" @click="uploadReset">
      </form>

      <div id="returnArea"></div>

      <!-- mui contains all contents of interface : storage infos, link to parent folder, #tree (files and folders) ... -->
      <div id="mui" v-if="this.folder">
        <h1 class="inline" :title="this.folder.title">{{ this.folder.title }}</h1>
        <a :id="'parent-'+ this.folder.parent" @click="open(folder.parent)" v-if="typeof this.folder.parent !== 'undefined'">
          <i class="fa fa-caret-up" aria-hidden="true"></i>
        </a>
        <table id="tree">
          <tr id="tree_head">
            <th width="44px">
              <input type="checkbox" id="sel_all" @click.stop="selAll"><label for="sel_all"></label>
            </th>
            <th></th>
            <th>Name</th>
            <th>Size</th>
            <th>Uploaded</th>
            <th>Options</th>
          </tr>
          <tr class="folder" v-for="folder in this.folder.folders" :key="folder.id"
            :id="'d'+ folder.id"
            :name="folder.name"
            :title="showSize(folder.size)"
            :data-folder="folder.parent"
            :data-path="folder.path"
            :data-title="folder.name"
            @click.stop.prevent="trigger('SelectionAddFolder', folder.id, $event)"
            @dblclick.stop.prevent="open(folder.id)"
            @contextmenu.stop.prevent="trigger('BoxOpen', folder.id, 2, $event)"
            draggable="true"
          >
            <!-- @click="Selection.addFolder()" -->
            <td class="file_checkbox">
              <input type="checkbox" :id="'sel_d'+ folder.id">
              <label :for="'sel_d'+ folder.id"></label>
            </td>
            <td><img src="../assets/img/desktop/extensions/folder.svg" class="icon"></td>
            <td>
              <strong>{{ folder.name }}</strong>
              [{{ folder.nb_elements }} {{ folder.nb_elements > 1 ? $t('User.elements') : $t('User.element') }}]
            </td>
            <td></td>
            <td></td>
            <td><a href="#" class="btn btn-actions"></a></td>
          </tr>
          <tr class="break"></tr>
          <tr v-for="file in this.folder.files" :key="file.id"
            :class="'file' + (file.size < 0 ? ' red' : '')"
            :id="'f' + file.id"
            :title="showSize(file.size) + '\n' + $t('User.lastmod') + ' ' + getDate(file.lastmod)"
            :data-folder="file.folder_id"
            :data-path="file.path"
            :data-title="file.name"
            :data-shared="file.is_shared ? 1 : 0"
            :data-url="file.url"
            @click.stop.prevent="trigger('SelectionAddFile', file.id, $event)"
            @dblclick.stop.prevent="startDownload(file.id)"
            @contextmenu.stop.prevent="trigger('BoxOpen', file.id, 1, $event)"
            draggable="true"
          >
            <!-- @click="Selection.addFile()" -->
            <!-- @dblclick="Selection.dl()" -->
            <td class="folder_checkbox">
              <input type="checkbox" :id="'sel_f' + file.id">
              <label :for="'sel_f' + file.id"></label>
            </td>
            <td></td>
            <td>
              <strong>{{ file.name }}</strong>
            </td>
            <td>{{ showSize(file.size) }}</td>
            <td>{{ getDate(file.lastmod) }}</td>
            <td><a href="#" class="btn btn-actions"></a></td>
          </tr>
        </table>
      </div>

      <div id="mui" v-else>
        {{ $t('Global.loading') }}
      </div>
    </section>

    <messageBox ref="messageBox"/>
    <box ref="box"/>
    <transfers ref="transfers"/>
  </div>
</template>

<script>
import store from '../store'
import bus from '../bus'
import moment from 'moment'
import messageBox from './messageBox'
import box from './box'
import transfers from './transfers'
import arrows from '../arrows'
import move from '../move'
import extIcons from '../extIcons'
import upload from '../upload'
import download from '../download'

export default {
  name: 'Folder',
  components: {
    messageBox, box, transfers
  },
  data () {
    return {
      shared: store.folder,
      folder: null
    }
  },
  methods: {
    open (folderId) {
      this.$router.push('/u/' + folderId)
      this.$http.post('folders/open', {folder_id: folderId, trash: (this.shared.trash ? 1 : 0)}).then((res) => {
        bus.$emit('SelectionRemoveAll')
        bus.$emit('BoxClose')
        this.shared.folder_id = folderId
        this.folder = res.body.data
        arrows.reset()
      }, (res) => {
        console.log('Error while opening a folder')
      })
    },
    back () {
      // Open parent folder
      let parent = document.querySelector('a[id^=parent-]')
      if (parent) {
        this.open(parent.id.replace('parent-', ''))
      }
    },
    add () {
      let validate = (e) => {
        let exclude = '/\\:*?<>|"'
        if (e.type === 'keydown' && e.keyCode !== 13) { // Check
          let key = e.key ? e.key : String.fromCharCode(e.keyCode)
          if (exclude.indexOf(key) === -1) {
            return true
          }
          return false
        } else if (e.type === 'click' || e.keyCode === 13) { // Send
          let index = this.$refs.messageBox.getIndexFromEvent(e)
          if (index !== false) {
            let name = document.querySelector('.MessageBox[data-index="' + index + '"] input[name="folder_name"]').value
            this.$refs.messageBox.close(index)
            this.$http.post('folders/add', {name: name, folder_id: this.shared.folder_id}).then((res) => {
              this.open(this.shared.folder_id)
            }, (res) => {
              console.log('Exists')
            })
          }
        }
        return true
      }
      this.$refs.messageBox.add({
        title: this.$t('RightClick.nFolder'),
        inputs: [
          {
            type: 'text',
            name: 'folder_name',
            id: 'nFolder',
            placeholder: this.$t('User.foldername'),
            autocomplete: 'off',
            autofocus: true,
            icon: 'fa fa-folder-o',
            keyDownEvent (e) {
              if (!validate(e)) {
                e.preventDefault()
              }
            }
          }
        ],
        btns: [
          {
            type: 'button',
            class: 'btn',
            value: 'OK',
            clickEvent (e) {
              validate(e)
            }
          }
        ]
      })
    },
    selAll (e) {
      if (e.target.checked) {
        bus.$emit('SelectionAddAll')
      } else {
        bus.$emit('SelectionRemoveAll')
      }
    },
    showSize (size, precision = 2) { // size => size in bytes
      size = parseInt(size)
      if (isNaN(size) || size <= 0) {
        return 0
      }
      if (this.$i18n.locale === null || typeof this.$i18n.messages[this.$i18n.locale] === 'undefined' || typeof this.$i18n.messages[this.$i18n.locale].Units === 'undefined') {
        return size
      }
      let base = Math.log(size) / Math.log(1000)
      let suffixes = Object.values(this.$i18n.messages[this.$i18n.locale].Units)
      return Math.pow(1000, base - Math.floor(base)).toFixed(precision) + ' ' + suffixes[Math.floor(base)]
    },
    getDate (timestamp) {
      let format = this.$t('Dates.date') + ' ' + this.$t('Dates.time')
      if (format === 'Dates.date Dates.time') {
        format = 'YYYY-MM-DD HH:mm'
      }
      return moment(timestamp * 1000).format(format)
    },
    uploadReset () {
      document.querySelector('#upFilesInput').value = ''
    },
    uploadDialog () {
      document.querySelector('#upFilesInput').click()
    },
    startUpload (e) {
      upload.upFiles(e.target.files)
    },
    startDownload (id) {
      download.dl(id)
    },
    keyListener (e) {
      let fired = true
      if (e.ctrlKey) { // CTRL + ...
        switch (e.keyCode) {
          case 65: // A
            if (!this.$parent.isInInput(e)) {
              bus.$emit('SelectionAddAll')
            } else {
              fired = false
            }
            break
          case 67: // C
            if (!this.$parent.isInInput(e)) {
              move.copy()
            } else {
              fired = false
            }
            break
          case 68: // D
            this.$parent.logout()
            break
          case 73: // I
            bus.$emit('SelectionInvert')
            break
          case 82: // R
            move.toTrash()
            break
          case 83:
            // TODO: dl selection
            break
          case 86: // V
            if (!this.$parent.isInInput(e)) {
              move.paste()
            } else {
              fired = false
            }
            break
          case 88: // X
            if (!this.$parent.isInInput(e)) {
              move.cut()
            } else {
              fired = false
            }
            break
          case 38: // UP
            arrows.up(true)
            break
          case 40: // DOWN
            arrows.down(true)
            break
          default:
            fired = false
        }
      } else {
        switch (e.keyCode) {
          case 8: // Backspace
            if (!this.$parent.isInInput(e)) {
              this.back()
            } else {
              fired = false
            }
            break
          case 13: // Enter
            if (!this.$parent.isInInput(e)) {
              if (store.selection.files.length === 1 && store.selection.folders.length === 0) {
                // TODO: dl file
              } else if (store.selection.files.length === 0 && store.selection.folders.length === 1) {
                this.open(store.selection.folders[0])
              }
            } else {
              fired = false
            }
            break
          case 27: // Esc
            bus.$emit('BoxClose')
            bus.$emit('SelectionRemoveAll')
            this.$refs.messageBox.closeAll() // TODO: Animate
            break
          case 38: // UP
            arrows.up()
            break
          case 40: // DOWN
            arrows.down()
            break
          case 46: // Delete
            if (!this.$parent.isInInput(e)) {
              // TODO: rm
            } else {
              fired = false
            }
            break
          case 112: // F1
            this.$refs.messageBox.add({
              txt: this.$t('Help.shortcuts').join('\n')
            })
            break
          default:
            fired = false
        }
      }

      if (fired) {
        e.preventDefault()
      }
    },
    trigger (event) {
      bus.$emit.apply(bus, arguments)
    }
  },
  created () {
    if (!this.$parent.isLogged()) {
      this.$parent.logout()
      return false
    }

    document.addEventListener('keydown', this.keyListener)

    bus.$on('FolderOpen', () => {
      this.open(this.shared.folder_id)
    })
    bus.$on('FolderOpenCurrent', () => {
      this.shared.trash = false
      this.open(this.shared.folder_id)
    })
    bus.$on('FolderOpenTrash', () => {
      this.shared.trash = true
      this.open(this.shared.folder_id)
    })
    bus.$on('FolderAdd', this.add)
    bus.$on('UploadDialog', this.uploadDialog)

    if (typeof this.$route.params.folder_id !== 'undefined') {
      this.shared.folder_id = this.$route.params.folder_id
    }

    this.open(this.shared.folder_id)
  },
  mounted () {
    // Show sidebar and selection div
    this.$parent.sidebar = true
    this.$parent.selection = true

    move.vue = this
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.keyListener)
    this.$parent.sidebar = false
    this.$parent.selection = false

    bus.$off('FolderOpen')
    bus.$off('FolderOpenCurrent')
    bus.$off('FolderOpenTrash')
    bus.$off('FolderAdd')
    bus.$off('UploadDialog')
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
<style src="../assets/css/2018/tree.css"></style>
