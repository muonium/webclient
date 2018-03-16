<template>
  <div class="container-max"
    @click="trigger('SelectionRemoveAll')"
    @contextmenu="trigger('BoxOpen', null, 0)"
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
        <input type="file" id="upFilesInput" name="files[]" multiple="multiple" class="hide" onchange="Upload.upFiles(this.files)" onclick="reset()">
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
            @contextmenu.stop.prevent="trigger('BoxOpen', folder.id, 2)"
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
            @contextmenu.stop.prevent="trigger('BoxOpen', file.id, 1)"
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
  </div>
</template>

<script>
import moment from 'moment'
import bus from '../bus'
import box from './box'
import messageBox from './messageBox'

export default {
  name: 'Folder',
  components: {
    messageBox, box
  },
  data () {
    return {
      folder_id: 0,
      folder: null,
      trash: false
    }
  },
  methods: {
    open (folderId) {
      this.$router.push('/u/' + folderId)
      this.$http.post('folders/open', {folder_id: folderId, trash: (this.trash ? 1 : 0)}).then((res) => {
        bus.$emit('SelectionRemoveAll')
        bus.$emit('BoxClose')
        this.folder_id = folderId
        this.folder = res.body.data
      }, (res) => {
        console.log('Error while opening a folder')
      })
    },
    add () {
      let validate = (e) => {
        let exclude = '/\\:*?<>|"'
        if (e.type === 'keypress' && e.keyCode !== 13) {
          let key = e.key ? e.key : String.fromCharCode(e.keyCode)
          if (exclude.indexOf(key) === -1) {
            return true
          }
          return false
        }
        if (e.type === 'click' || e.keyCode === 13) { // Send
          let index = this.$refs.messageBox.getIndexFromEvent(e)
          if (index !== false) {
            let name = document.querySelector('.MessageBox[data-index="' + index + '"] input[name="folder_name"]').value
            this.$refs.messageBox.close(index)
            this.$http.post('folders/add', {name: name, folder_id: this.folder_id}).then((res) => {
              this.open(this.folder_id)
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
            icon: 'fa fa-folder-o',
            keyPressEvent (e) {
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
    keyListener (e) {
      let fired = true
      if (e.ctrlKey) {
        switch (e.keyCode) {
          case 68: // D
            this.$parent.logout()
            break
          case 65: // A
            bus.$emit('SelectionAddAll')
            break
          case 73: // I
            bus.$emit('SelectionInvert')
            break
          default:
            fired = false
        }
      } else {
        fired = false
      }

      if (fired) {
        e.preventDefault()
      }
    },
    trigger (event) {
      bus.$emit.apply(bus, arguments)
    }
  },
  beforeCreate () {
    // Show sidebar and selection div
    this.$parent.sidebar = true
    this.$parent.selection = true
  },
  created () {
    if (!this.$parent.isLogged()) {
      this.$parent.logout()
      return false
    }

    document.addEventListener('keydown', this.keyListener)

    bus.$on('FolderOpenCurrent', () => {
      this.trash = false
      this.open(this.folder_id)
    })
    bus.$on('FolderOpenTrash', () => {
      this.trash = true
      this.open(this.folder_id)
    })
    bus.$on('FolderAdd', this.add)

    if (typeof this.$route.params.folder_id !== 'undefined') {
      this.folder_id = this.$route.params.folder_id
    }

    this.open(this.folder_id)
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.keyListener)
    this.$parent.sidebar = false
    this.$parent.selection = false

    bus.$off('FolderOpenCurrent')
    bus.$off('FolderOpenTrash')
    bus.$off('FolderAdd')
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
<style src="../assets/css/2018/tree.css"></style>
