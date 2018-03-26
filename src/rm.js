import bus from './bus'
import store from './store'

class Rm {
  constructor () {
    this.files = []
    this.folders = []
    this.vue = {}
  }

  rm (id, type, callback = false, showConfirm = true) {
    if (store.selection.files.length === 0 && store.selection.folders.length === 0) {
      if (id === undefined || (type !== 1 && type !== 2)) {
        return false
      }
      this.files = []
      this.folders = []
      if (type === 1) {
        this.files = [id]
      } else if (type === 2) {
        this.folders = [id]
      }
    } else {
      this.files = store.selection.files
      this.folders = store.selection.folders
    }

    if (showConfirm && !confirm(this.vue.$t('User.questionrm'))) {
      return false
    }

    let files = []
    let folders = []

    if (this.files.length > 0) { // Get folder_id for each files because it can be different if we are in trash
      for (let file of this.files) {
        let f = document.querySelector('#f' + file)
        if (f) {
          let fFolder = parseInt(f.getAttribute('data-folder'))
          if (!isNaN(fFolder)) {
            files.push({id: file, folder_id: fFolder})
          }
        }
      }
    }

    if (this.folders.length > 0) { // The same for folders
      for (let folder of this.folders) {
        let d = document.querySelector('#d' + folder)
        if (d) {
          let dFolder = parseInt(d.getAttribute('data-folder'))
          if (!isNaN(dFolder)) {
            folders.push({id: folder, parent: dFolder})
          }
        }
      }
    }

    this.vue.$http.post('rm', {files: files, folders: folders}).then((res) => {
      if (callback === false) {
        bus.$emit('FolderOpen')
      } else {
        callback()
      }
    }, (res) => {
      console.log(res)
    })
  }
}

export default new Rm()
