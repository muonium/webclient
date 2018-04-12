<template>
  <div class="container-max"
    @click="trigger('SelectionRemoveAll')"
    @contextmenu="trigger('BoxOpen', null, 0, $event)"
  >
    <vue-headful
      title="Muonium"
    />
    <div id="display">
      <input type="radio" id="display_list" name="display" :checked="this.shared.display === 'list'">
      <label for="display_list" class="nomargin" @click="changeDisplay('list')">
        <i class="fa fa-th-list" aria-hidden="true"></i>
      </label>

      <input type="radio" id="display_mosaic" name="display" :checked="this.shared.display === 'mosaic'">
      <label for="display_mosaic" class="nomargin" @click="changeDisplay('mosaic')">
        <i class="fa fa-th-large" aria-hidden="true"></i>
      </label>
    </div>

    <section id="desktop">
      <!-- Hidden upload form -->
      <form class="hidden">
        <input type="file" id="upFilesInput" name="files[]" multiple="multiple" class="hide" @change="startUpload($event)" @click="uploadReset">
      </form>

      <!-- mui contains all contents of interface : storage infos, link to parent folder, #tree (files and folders) ... -->
      <transition name="fade">
        <div id="mui" v-show="!this.animate">
          <template v-if="this.folder">
            <h1 class="inline" :title="this.folder.title">{{ this.folder.title !== null ? utils.htmlspecialcharsDecode(this.folder.title) : $t('Global.home') }}</h1>
            <a :id="'parent-'+ this.folder.parent" @click="open(folder.parent)" v-if="typeof this.folder.parent !== 'undefined'">
              <i class="fa fa-caret-up" aria-hidden="true"></i>
            </a>
            <table id="tree" :class="this.shared.display === 'mosaic' ? 'mosaic' : ''">
              <tr id="tree_head" v-show="this.folder.folders.length > 0 || this.folder.files.length > 0">
                <th width="44px">
                  <input type="checkbox" id="sel_all" @click.stop="selAll"><label for="sel_all"></label>
                </th>
                <th></th>
                <th>{{ $t('Tree.name') }}</th>
                <th>{{ $t('Tree.size') }}</th>
                <th>{{ $t('Tree.uploaded') }}</th>
                <th>{{ $t('Tree.options') }}</th>
              </tr>
              <tr class="folder" v-for="folder in this.folder.folders" :key="'folder-' + folder.id"
                :id="'d'+ folder.id"
                :name="folder.name"
                :title="utils.showSize(folder.size)"
                :data-folder="folder.parent"
                :data-path="folder.path"
                :data-title="folder.name"
                @click.stop.prevent="trigger('SelectionAddFolder', folder.id, $event)"
                @dblclick.stop.prevent="open(folder.id)"
                @contextmenu.stop.prevent="trigger('BoxOpen', folder.id, 2, $event)"
                @dragstart="drag($event)"
                draggable="true"
              >
                <td class="folder_checkbox">
                  <input type="checkbox" :id="'sel_d'+ folder.id">
                  <label :for="'sel_d'+ folder.id"></label>
                </td>
                <td><img :src="$parent.base + 'static/img/desktop/extensions/folder.svg'" class="icon"></td>
                <td>
                  <strong>{{ utils.htmlspecialcharsDecode(folder.name) }}</strong>
                  [{{ folder.nb_elements }} {{ folder.nb_elements > 1 ? $t('Tree.elements') : $t('Tree.element') }}]
                </td>
                <td></td>
                <td></td>
                <td>
                  <a href="#" class="btn btn-actions" @click.stop.prevent="trigger('BoxOpen', folder.id, 2, $event)"></a>
                </td>
              </tr>
              <tr class="break"></tr>
              <tr v-for="file in this.folder.files" :key="'file-' + file.id"
                :class="'file' + (file.is_completed ? '' : ' red')"
                :id="'f' + file.id"
                :title="utils.showSize(file.size) + '\n' + $t('Tree.lastmod') + ' ' + utils.getDate(file.lastmod)"
                :data-folder="file.folder_id"
                :data-path="file.path"
                :data-title="file.name"
                :data-shared="file.is_shared ? 1 : 0"
                :data-url="file.url"
                @click.stop.prevent="trigger('SelectionAddFile', file.id, $event)"
                @dblclick.stop.prevent="startDownload(file.id)"
                @contextmenu.stop.prevent="trigger('BoxOpen', file.id, 1, $event)"
                @dragstart="drag($event)"
                draggable="true"
              >
                <td class="file_checkbox">
                  <input type="checkbox" :id="'sel_f' + file.id">
                  <label :for="'sel_f' + file.id"></label>
                </td>
                <td><img :src="$parent.base + 'static/img/desktop/extensions/' + getIcon(file.name) + '.svg'" class="icon"></td>
                <td>
                  <strong>{{ utils.htmlspecialcharsDecode(file.name) }}</strong>
                </td>
                <td class="file_size">{{ utils.showSize(file.size) }}</td>
                <td class="file_lastmod">{{ utils.getDate(file.lastmod) }}</td>
                <td>
                  <a href="#" class="btn btn-actions" @click.stop.prevent="trigger('BoxOpen', file.id, 1, $event)"></a>
                </td>
              </tr>
            </table>

            <template v-if="this.shared.folder_id === 0">
              <template v-if="this.folder.folders.length === 0 && this.folder.files.length === 0">
                <div class="info mtop">
                  <a @click="showHelp">{{ $t('Tree.needHelp') }}</a>
                </div>
                <div class="bloc-nothing" v-if="!this.shared.trash" @click="uploadDialog">
                  {{ $t('Tree.upNothing') }}<br>
                  <img src="../assets/img/desktop/ic-no-uploads.png"><br>
                  <span>{{ $t('Tree.first') }}</span>
                </div>
                <div class="bloc-trash-nothing" v-else>
                  {{ $t('Tree.trashNothing') }}<br>
                  <img src="../assets/img/desktop/ic-no-trash-dark.png" v-if="this.$parent.theme === 'dark'">
                  <img src="../assets/img/desktop/ic-no-trash-light.png" v-else>
                </div>
              </template>
            </template>
          </template>
          <template v-else>
            {{ $t('Global.loading') }}
          </template>
        </div>
      </transition>
    </section>

    <messageBox ref="messageBox"/>
    <box ref="box"/>
    <transfers ref="transfers"/>
  </div>
</template>

<script>
import store from '../store'
import bus from '../bus'
import utils from '../utils'
import messageBox from './messageBox'
import box from './box'
import transfers from './transfers'
import arrows from '../arrows'
import move from '../move'
import rm from '../rm'
import share from '../share'
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
      folder: null,
      animate: true
    }
  },
  methods: {
    open (folderId) {
      this.$router.push('/u/' + folderId)
      this.animate = this.shared.folder_id !== parseInt(folderId)
      this.$http.post('folders/open', {folder_id: folderId, trash: (this.shared.trash ? 1 : 0)}).then((res) => {
        this.animate = false
        bus.$emit('SelectionRemoveAll')
        bus.$emit('BoxClose')
        this.shared.folder_id = parseInt(folderId)
        this.shared.stored = res.body.data.stored
        this.shared.quota = res.body.data.quota
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
      if (!this.$refs.messageBox.hasType('nFolder')) {
        this.$refs.messageBox.add({
          type: 'nFolder',
          title: this.$t('Selection.nFolder'),
          inputs: [
            {
              type: 'text',
              name: 'folder_name',
              id: 'nFolder',
              placeholder: this.$t('Tree.foldername'),
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
      }
    },
    changeDisplay (d) {
      if (d === 'mosaic' || d === 'list') {
        this.shared.display = d
        localStorage.setItem('display', d)
      }
    },
    drag (e) {
      e.dataTransfer.setData('text', e.target.id)
    },
    drop (e) {
      e.preventDefault()
      e.stopPropagation()
      if (e.dataTransfer.files.length === 0) {
        if (e.dataTransfer.getData('text') !== '') { // Move file/folder with drag/drop
          let target = e.target
          let targetId = null
          let id = parseInt(e.dataTransfer.getData('text').substr(1))
          let type = e.dataTransfer.getData('text').substr(0, 1) === 'f' ? 1 : 2
          while (target) {
            if (target.tagName === 'TR' && (target.classList.contains('file') || target.classList.contains('folder'))) {
              targetId = target.id
              break
            }
            target = target.parentElement
          }
          target = e.target

          if (targetId !== undefined && targetId !== null && targetId.length > 1 && targetId.substr(0, 1) === 'd') {
            targetId = parseInt(targetId.substr(1))
            move.cut(id, type)
            move.paste(targetId)
            move.reset()
          } else {
            if (target.nodeName === 'I') target = target.parentNode
            if (target && target.nodeName === 'A' && target.id !== undefined && target.id !== null && target.id.indexOf('parent-') !== -1) {
              targetId = parseInt(target.id.replace('parent-', ''))
              move.cut(id, type)
              move.paste(targetId)
              move.reset()
            }
          }
        } else {
          return false
        }
      } else { // Move file(s) from client to Mui
        upload.upFiles(e.dataTransfer.files, this, typeof e.dataTransfer.items !== 'undefined' ? e.dataTransfer.items : null)
      }
    },
    selAll (e) {
      if (e.target.checked) {
        bus.$emit('SelectionAddAll')
      } else {
        bus.$emit('SelectionRemoveAll')
      }
    },
    getIcon (filename) {
      return extIcons.get(filename)
    },
    uploadReset () {
      document.querySelector('#upFilesInput').value = ''
    },
    uploadDialog () {
      document.querySelector('#upFilesInput').click()
    },
    startUpload (e) {
      upload.upFiles(e.target.files, this)
    },
    startDownload (id) {
      download.dlFiles([id], this)
    },
    showHelp () {
      if (!this.$refs.messageBox.hasType('help')) {
        this.$refs.messageBox.add({
          type: 'help',
          txt: this.$t('Help.shortcuts').join('\n'),
          btns: [
            {
              type: 'button',
              class: 'btn',
              value: 'OK',
              clickEvent: (e) => {
                let index = this.$refs.messageBox.getIndexFromEvent(e)
                if (index !== false) this.$refs.messageBox.close(index)
              }
            }
          ]
        })
      }
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
          case 83: // S
            bus.$emit('SelectionDl')
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
                download.dlFiles(store.selection.files, this)
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
            this.$refs.messageBox.closeAll()
            break
          case 38: // UP
            arrows.up()
            break
          case 40: // DOWN
            arrows.down()
            break
          case 46: // Delete
            if (!this.$parent.isInInput(e)) {
              rm.rm()
            } else {
              fired = false
            }
            break
          case 112: // F1
            this.showHelp()
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
  computed: {
    utils () {
      return utils
    }
  },
  created () {
    if (!this.$parent.isLogged()) {
      this.$parent.logout()
      return false
    }

    document.addEventListener('keydown', this.keyListener)

    bus.$on('FolderOpen', (id = this.shared.folder_id) => {
      this.open(id)
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

    let display = localStorage.getItem('display')
    if (display === 'list' || display === 'mosaic') {
      this.shared.display = display
    }

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
    rm.vue = this
    share.vue = this

    document.querySelector('body').addEventListener('dragover', (e) => e.preventDefault())
    document.querySelector('body').addEventListener('drop', (e) => this.drop(e))
  },
  beforeDestroy () {
    this.$parent.sidebar = false
    this.$parent.selection = false

    document.removeEventListener('keydown', this.keyListener)
    document.querySelector('body').removeEventListener('dragover', (e) => e.preventDefault())
    document.querySelector('body').removeEventListener('drop', (e) => this.drop(e))

    bus.$off('FolderOpen')
    bus.$off('FolderOpenCurrent')
    bus.$off('FolderOpenTrash')
    bus.$off('FolderAdd')
    bus.$off('UploadDialog')
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.fade-enter-active {
  transition: opacity .4s;
}
.fade-enter, .fade-leave-active {
  opacity: 0;
}
</style>
<style src="../assets/css/2018/tree.css"></style>
