import store from './store'
import bus from './bus'

class Encryption {
  constructor (file, destFolder, id) {
    this.file = file
    this.dest_folder = destFolder
    this.id = id
    store.transfers.upload.push({
      id: id,
      name: file.name,
      pct: 0
    })
  }

  abort () {
    // Abort encryption process
    console.log('abort ' + this.file.name)
  }
}

class Upload {
  constructor () {
    this.enc = []
    this.yesReplaceAll = false
    this.yesCompleteAll = false
    this.noAll = false
  }

  upFiles (files) {
    store.folder.transfers = true
    bus.$emit('SidebarOpenTransfers')
    this.yesReplaceAll = false
    this.yesCompleteAll = false
    this.noAll = false
    for (let i = 0; i < files.length; i++) {
      this.enc.push(new Encryption(files[i], store.folder.folder_id, this.enc.length))
    }
  }

  abort (id) {
    this.enc[id].abort()
  }
}

export default new Upload()
