import store from './store'
import bus from './bus'
import sjcl from 'sjcl'

let vue = {}
let debug = true

class Decryption {
  constructor (fileId, fromFolder, id) {
    this.cek = sessionStorage.getItem('cek')
    this.halt = false

    if (this.cek === null) return false

    this.fid = fileId
    this.folderId = fromFolder
    this.id = id
    this.filename = null

    vue.$set(store.transfers.download, this.id, {
      name: this.filename,
      pct: 0,
      error: false,
      error_msg: null
    })
    if (debug) console.log('Transfers ID: ' + this.id)
  }

  abort () {
    // Abort encryption process
    this.halt = true
    vue.$delete(store.transfers.download, this.id)
    if (debug) console.log('aborted ' + this.filename)
  }
}

class Download {
  constructor () {
    this.dec = []
  }

  checkAPI () {
    return window.File && window.Blob
  }

  dlFiles (files, v) {
    vue = v
    if (!this.checkAPI()) {
      alert(vue.$t('User.fileAPI'))
      return false
    }
    store.folder.transfers = true
    store.transfers.upSelected = false
    bus.$emit('SidebarOpenTransfers')

    for (let i = 0; i < files.length; i++) {
      this.dec.push(new Decryption(files[i], store.folder.folder_id, this.dec.length))
    }
  }

  abort (id) {
    this.dec[id].abort()
  }
}

export default new Download()
