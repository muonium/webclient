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
      <div id="mui">
        {{ $t('Global.loading') }}
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Folder',
  data () {
    return {
      folder_id: 0,
      trash: false
    }
  },
  methods: {
    open (folderId) {
      this.$http.post('folders/open', {folder_id: folderId, trash: (this.trash ? 1 : 0)}).then((res) => {
        console.log(res)
      }, (res) => {
        //
      })
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

    if (typeof this.$route.params.folder_id !== 'undefined') {
      this.folder_id = this.$route.params.folder_id
    }

    this.open(this.folder_id)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
<style src="../assets/css/2018/tree.css"></style>
