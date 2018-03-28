import store from './store'
import bus from './bus'
import sjcl from 'sjcl'
import 'idb.filesystem.js'

let vue = {}
let debug = true
let smallQuota = 1024 * 1024
let largeQuota = smallQuota * 1024 * 100
window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem

class Decryption {
  constructor (fileId, filename, fromFolder, id, uid = null, fek = null) {
    // uid and fek for shared files not owned by user
    this.halt = false
    this.enc = null
    this.sPrev = null
    this.currentChunk = 0

    this.fid = fileId
    this.filename = filename
    this.folderId = fromFolder
    this.id = id // Transfers ID
    this.uid = uid
    this.fek = fek

    if (uid !== null && fek !== null) {
      this.cek = null
      this.target = 'dl'
    } else { // Owned by user, cek is needed
      this.cek = sessionStorage.getItem('cek')
      this.target = 'files'
      if (this.cek === null) return false
    }

    if (this.filename.length === 0) {
      this.abort()
      return false
    }

    vue.$set(store.transfers.download, this.id, {
      name: this.filename,
      pct: 0,
      error: false,
      error_msg: null
    })
    if (debug) console.log('Transfers ID: ' + this.id)

    // Get number of chunks
    vue.$http.post(this.target + '/nbChunks', {uid: this.uid, filename: this.filename, folder_id: this.folderId}).then((res) => {
      this.nbChunks = parseInt(res.body.data)
      if (debug) console.log('Number of chunks: ' + this.nbChunks)
      this.read()
    }, (res) => {
      this.abort()
      return false
    })
  }

  read (chunkNb = 0) {
    if (this.halt) return false
    if (debug) console.log('Requesting chunk ' + chunkNb)

    vue.$http.post(this.target + '/chunk', {uid: this.uid, filename: this.filename, folder_id: this.folderId, line: chunkNb}).then((res) => {
      this.currentChunk = chunkNb
      if (debug) console.log('Got chunk ' + chunkNb + ' contents')
      let chunk = res.body.data.split(':')
      if (chunk.length !== 4) {
        throw new sjcl.exception.corrupt('Error :: Incomplete chunk!') // eslint-disable-line new-cap
      }
      this.updatePct(false)

      let c = sjcl.codec.base64.toBits(chunk[0])
      let s = sjcl.codec.base64.toBits(chunk[1])
      let a = sjcl.codec.base64.toBits(chunk[2])
      let i = sjcl.codec.base64.toBits(chunk[3])

      if (this.enc === null || this.sPrev !== chunk[1]) {
        if (debug) console.log('Key derivation process...')
        // If uid and fek are set, then use fek instead
        let key = this.uid !== null && this.fek !== null ? this.fek : sjcl.misc.pbkdf2(this.cek, s, 7000, 256)
        this.enc = new sjcl.cipher.aes(key) // eslint-disable-line new-cap
      }
      this.sPrev = chunk[1]

      chunk = sjcl.mode.gcm.decrypt(this.enc, c, i, a, 128)
      chunk = this.fromBitArrayCodec(chunk)
      chunk = new Uint8Array(chunk)

      // Use FileSystem API
      window.requestFileSystem(window.PERSISTENT, largeQuota, (fs) => {
        fs.root.getFile(this.filename, {create: true}, (fileEntry) => {
          fileEntry.createWriter((fileWriter) => {
            fileWriter.onwriteend = (e) => {
              // Chunk written on FileSystem
              if (debug) console.log('Chunk ' + chunkNb + ': Write completed')
              this.updatePct(true)
              if (this.currentChunk + 1 >= this.nbChunks) { // currentChunk start at chunk 0
                // All chunks are written
                this.dl(fileEntry)
              } else {
                // Write next chunk
                this.read(this.currentChunk + 1)
              }
            }

            // Write at the end of the file
            fileWriter.seek(fileWriter.length)
            fileWriter.write(new Blob([chunk]))
          }, this.error)
        }, () => {
          // If we can't write to filesystem, request a quota
          this.requestQuota(this.read, this.currentChunk, largeQuota)
        })
      }, this.error)
    }, (res) => {
      this.abort()
      return false
    })
  }

  dl (fileEntry) {
    // Try to download the file (move from FileSystem to user download folder)
    if (debug) console.log('Done!')

    let start = (url, revoke = false) => {
      document.querySelector('#dl_decrypted').href = url
      document.querySelector('#dl_decrypted').download = this.filename
      document.querySelector('#dl_decrypted').click()

      // Once downloaded, remove the file from FileSystem
      setTimeout(() => {
        this.rm()
        if (revoke) {
          if (debug) console.log('Removing temp url')
          window.URL.revokeObjectURL(url)
        }
      }, 2000)
    }

    if (typeof fileEntry.file === 'function') {
      fileEntry.file((file) => {
        if (window.navigator.msSaveBlob) { // Microsoft
          window.navigator.msSaveBlob(new Blob([file]), this.filename)
        } else {
          let f = new File([file], this.filename)
          if (debug) console.log('Creating temp url')
          start(window.URL.createObjectURL(f))
        }
      }, () => {
        start(fileEntry.toURL(), true)
      })
    } else {
      start(fileEntry.toURL(), true)
    }
  }

  rm () {
    window.requestFileSystem(window.PERSISTENT, smallQuota, (fs) => {
      fs.root.getFile(this.filename, {create: false}, (fileEntry) => {
        fileEntry.remove(() => {
          if (debug) console.log('File removed')
        }, this.error)
      }, () => { // If we can't delete to filesystem, request a quota
        this.requestQuota(this.rm, null, smallQuota)
      })
    }, this.error)
  }

  requestQuota (fc, arg, quota) {
    if (debug) console.log('Mui cannot download contents for now. Requesting quota...')
    if (navigator.webkitPersistentStorage === undefined) {
      if (debug) console.log('Your web browser is currently not supported by Mui app')
      this.abort()
      return false
    }
    quota = quota === undefined ? smallQuota : quota
    navigator.webkitPersistentStorage.requestQuota(quota, (grantedBytes) => {
      if (grantedBytes > 0) {
        if (debug) console.log('Allowed quota')
        fc.bind(this, arg)()
      } else {
        if (debug) console.log('Denied quota')
        this.abort()
      }
    }, () => {
      if (debug) console.log('Error while requesting quota')
      this.abort()
    })
  }

  fromBitArrayCodec (arr) {
    // Convert from a bitArray to an array of bytes.
    let out = []
    let bl = sjcl.bitArray.bitLength(arr)
    let i
    let tmp
    for (i = 0; i < bl / 8; i++) {
      if ((i & 3) === 0) {
        tmp = arr[i / 4]
      }
      out.push(tmp >>> 24)
      tmp <<= 8
    }
    return out
  }

  updatePct (writeCompleted = false) {
    let c = writeCompleted ? this.currentChunk + 1 : this.currentChunk + 0.5
    let pct = Math.round(c / this.nbChunks * 100)
    let row = store.transfers.download[this.id]
    row.pct = pct > 100 ? 100 : pct
    vue.$set(store.transfers.download, this.id, row)
    if (row.pct === 100) {
      setTimeout(() => {
        vue.$delete(store.transfers.download, this.id)
      }, 800)
    }
  }

  error (msg = '', msg2 = '') {
    if (debug) console.log('Error', msg, msg2)
    bus.$emit('TransfersSetError', 'download', this.id, msg)
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
    return window.File && window.Blob && window.requestFileSystem
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

    let dl = (i) => {
      let row = document.querySelector('#f' + files[i]) // Get filename
      if (row !== null && row.getAttribute('data-title') !== null && row.getAttribute('data-title') !== '') {
        this.dec.push(new Decryption(files[i], row.getAttribute('data-title'), store.folder.folder_id, this.dec.length))
      }
    }

    let i = 0
    dl(i)
    if (files.length > 1) {
      let timer = setInterval(() => {
        i++
        dl(i)
        if (i >= files.length - 1) {
          clearInterval(timer)
        }
      }, 500)
    }
  }

  abort (id) {
    this.dec[id].abort()
  }
}

export default new Download()
