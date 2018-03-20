import bus from './bus'
import store from './store'

class Move {
  // type: 1: file, 2: folder
  constructor () {
    this.state = 0 // 0: cut - 1: copy
    this.from = 0 // folder id where files/folders to move are located
    this.vue = {} // Vue context, in order to do http requests
  }

  mv (id, type) {
    this.from = store.folder.folder_id
    if (store.selection.files.length === 0 && store.selection.folders.length === 0) {
      this.reset()
      if (type === 1) {
        store.move.files = [id]
      } else if (type === 2) {
        store.move.folders = [id]
      }
    } else {
      store.move.files = store.selection.files
      store.move.folders = store.selection.folders
    }
    console.log(store)
  }

  cut (id, type) {
    this.state = 0
    this.mv(id, type)
  }

  copy (id, type) {
    this.state = 1
    this.mv(id, type)
  }

  paste (dest) {
    let to = store.folder.folder_id
    if (store.selection.files.length === 0 && store.selection.folders.length === 1) {
      // Paste in selected folder instead current folder
      to = store.selection.folders[0]
    }
    if (dest !== undefined) {
      to = dest
    }

    this.vue.$http.post('mv', {
      copy: this.state,
      files: store.move.files,
      folders: store.move.folders,
      old_folder_id: this.from,
      folder_id: to
    }).then((res) => {
      bus.$emit('FolderOpenCurrent')
    }, (res) => {
      console.log(res)
    })
  }

  fromTrash (id, type) {
    let files = []
    let folders = []
    if (store.selection.files.length === 0 && store.selection.folders.length === 0) {
      if (type === 1) {
        files = [id]
      } else if (type === 2) {
        folders = [id]
      }
    } else {
      files = store.selection.files
      folders = store.selection.folders
    }

    this.vue.$http.delete('trash', {files: files, folders: folders}).then((res) => {
      bus.$emit('FolderOpenCurrent')
    }, (res) => {
      console.log(res)
    })
  }

  toTrash (id, type) {
    let files = []
    let folders = []
    if (store.selection.files.length === 0 && store.selection.folders.length === 0) {
      if (type === 1) {
        files = [id]
      } else if (type === 2) {
        folders = [id]
      }
    } else {
      files = store.selection.files
      folders = store.selection.folders
    }

    this.vue.$http.post('trash', {files: files, folders: folders}).then((res) => {
      bus.$emit('FolderOpenCurrent')
    }, (res) => {
      console.log(res)
    })
  }

  rename () {
    // TODO: Rename
  }

  reset () {
    store.move.files = []
    store.move.folders = []
  }
}

export default new Move()
