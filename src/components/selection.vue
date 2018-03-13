<template>
  <div id="selection">
    <div class="fixed">
      <section class="selection">
        <button id="up_btn" class="btn btn-large mbottom" onclick="Upload.dialog()">{{ $t('RightClick.upFiles') }}</button>

        <a href="#" id="up_icon" class="blue block" onclick="Upload.dialog(event)" :title="$t('RightClick.upFiles')">
          <i class="fa fa-upload" aria-hidden="true"></i>
        </a>

        <a href="#" id="create_btn" class="blue block" onclick="Folders.create(event)" :title="$t('RightClick.nFolder')">
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
    addFile (id) {
      if (this.files.indexOf(id) === -1) {
        console.log('add file')
        this.files.push(id)
        document.querySelector('#f' + id).classList.add('selected')
      } else {
        this.removeFile(id)
      }
    },
    addFolder (id) {
      if (this.folders.indexOf(id) === -1) {
        console.log('add folder')
        this.folders.push(id)
        document.querySelector('#d' + id).classList.add('selected')
      } else {
        this.removeFolder(id)
      }
    },
    removeFile (id) {
      console.log('remove file')
      let pos = this.files.indexOf(id)
      if (pos !== -1) {
        this.$delete(this.files, pos)
        document.querySelector('#f' + id).classList.remove('selected')
      }
    },
    removeFolder (id) {
      console.log('remove folder')
      let pos = this.folders.indexOf(id)
      if (pos !== -1) {
        this.$delete(this.folders, pos)
        document.querySelector('#d' + id).classList.remove('selected')
      }
    }
  },
  created () {
    bus.$on('SelectionAddFile', (id) => this.addFile(id))
    bus.$on('SelectionAddFolder', (id) => this.addFolder(id))
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
<style src="../assets/css/2018/selection.css"></style>
