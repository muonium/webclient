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
      if (id === undefined || (type !== 1 && type !== 2)) {
        return false
      }
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
      bus.$emit('FolderOpen')
    }, (res) => {
      console.log(res)
    })
  }

  fromTrash (id, type) {
    let files = []
    let folders = []
    if (store.selection.files.length === 0 && store.selection.folders.length === 0) {
      if (id === undefined || (type !== 1 && type !== 2)) {
        return false
      }
      if (type === 1) {
        files = [id]
      } else if (type === 2) {
        folders = [id]
      }
    } else {
      files = store.selection.files
      folders = store.selection.folders
    }

    this.vue.$http.post('trash/from', {files: files, folders: folders}).then((res) => {
      bus.$emit('FolderOpen')
    }, (res) => {
      console.log(res)
    })
  }

  toTrash (id, type) {
    let files = []
    let folders = []
    if (store.selection.files.length === 0 && store.selection.folders.length === 0) {
      if (id === undefined || (type !== 1 && type !== 2)) {
        return false
      }
      if (type === 1) {
        files = [id]
      } else if (type === 2) {
        folders = [id]
      }
    } else {
      files = store.selection.files
      folders = store.selection.folders
    }

    this.vue.$http.post('trash/to', {files: files, folders: folders}).then((res) => {
      bus.$emit('FolderOpen')
    }, (res) => {
      console.log(res)
    })
  }

  rename (id, type) {
    let row = document.querySelector('#' + (type === 1 ? 'f' : 'd') + id)
    if (id === undefined || (type !== 1 && type !== 2) || row === null) {
      return false
    }
    let target = type === 1 ? 'files/rename' : 'folders/rename'
    let oldName = row.getAttribute('data-title')

    let validate = (e) => {
      let exclude = '/\\:*?<>|"'
      if (e.type === 'keydown' && e.keyCode !== 13) { // Check
        let key = e.key ? e.key : String.fromCharCode(e.keyCode)
        if (exclude.indexOf(key) === -1) {
          return true
        }
        return false
      } else if (e.type === 'click' || e.keyCode === 13) { // Send
        let index = this.vue.$refs.messageBox.getIndexFromEvent(e)
        if (index !== false) {
          let newName = document.querySelector('.MessageBox[data-index="' + index + '"] input[name="elem_name"]').value
          this.vue.$refs.messageBox.close(index)
          if (newName !== oldName) {
            this.vue.$http.post(target, {old: oldName, new: newName, folder_id: store.folder.folder_id}).then((res) => {
              bus.$emit('FolderOpen')
            }, (res) => {
              console.log(res)
            })
          }
        }
      }
      return true
    }

    this.vue.$refs.messageBox.add({
      title: this.vue.$t('Selection.mvItem'),
      inputs: [
        {
          type: 'text',
          name: 'elem_name',
          id: 'nRename',
          value: oldName,
          placeholder: this.vue.$t('Tree.name'),
          autocomplete: 'off',
          autofocus: true,
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

  reset () {
    store.move.files = []
    store.move.folders = []
  }
}

export default new Move()
