<template>
  <div class="container-max">
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
            <th width="44px"><input type="checkbox" id="sel_all"><label for="sel_all"></label></th>
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
            @click.prevent="trigger('SelectionAddFolder', folder.id, $event)"
            @dblclick.prevent="open(folder.id)"
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
            :class="'file' + file.size < 0 ? ' red' : ''"
            :id="'f' + file.id"
            :title="showSize(file.size) + '\n' + $t('User.lastmod') + ' ' + getDate(file.lastmod)"
            :data-folder="file.folder_id"
            :data-path="file.path"
            :data-title="file.name"
            :data-shared="file.is_shared ? 1 : 0"
            :data-url="file.url"
            @click.prevent="trigger('SelectionAddFile', file.id, $event)"
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
  </div>
</template>

<script>
import moment from 'moment'
import bus from '../bus'

export default {
  name: 'Folder',
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
        this.folder_id = folderId
        this.folder = res.body.data
      }, (res) => {
        console.log('Error while opening a folder')
      })
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
    }

    bus.$on('FolderOpenCurrent', () => {
      this.trash = false
      this.open(this.folder_id)
    })
    bus.$on('FolderOpenTrash', () => {
      this.trash = true
      this.open(this.folder_id)
    })

    if (typeof this.$route.params.folder_id !== 'undefined') {
      this.folder_id = this.$route.params.folder_id
    }

    this.open(this.folder_id)
  },
  destroyed () {
    this.$parent.sidebar = false
    this.$parent.selection = false
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
<style src="../assets/css/2018/tree.css"></style>
