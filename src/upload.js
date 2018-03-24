import store from './store'
import bus from './bus'
import sjcl from 'sjcl'

let vue = {}
let chunkSize = 512 * 1024 // Size of one chunk in B
let debug = true

let yesReplaceAll = false
let yesCompleteAll = false
let noAll = false

class Encryption {
  constructor (file, destFolder, id) {
    this.cek = sessionStorage.getItem('cek')
    this.est = 1.335 // Estimation of the difference between the file and encrypted file
    this.halt = false

    if (this.cek === null) return false

    this.salt = sjcl.random.randomWords(4) // crypto parameter: salt - 128 bits long
    this.key = sjcl.misc.pbkdf2(this.cek, this.salt, 7000, 256) // key derivation
    this.enc = new sjcl.cipher.aes(this.key) // eslint-disable-line new-cap

    this.file = file
    this.dest_filename = file.name.replace(/<\/?[^>]+(>|$)/g, '')
    this.dest_folder = destFolder
    this.id = id
    this.est_size = Math.round(file.size * this.est) // Estimation of encrypted file size

    this.start = 0 // Start to write at chunk x
    this.chRead = 0 // Number of chunks read
    this.chWritten = 0 // Number of chunks written
    this.bWritten = 0 // Number of B written
    this.offset = 0

    store.transfers.upload[id] = {
      name: this.dest_filename,
      pct: 0,
      error: false,
      error_msg: null
    }

    this.checkStatus() // Once initialized, check status before uploading
  }

  read (start = 0) {
    this.start = start

    let readChunk = () => {
      let r = new FileReader()
      let blob = this.file.slice(this.offset, chunkSize + this.offset)
      r.onload = (e) => { // Block loaded
        let chkLength = e.target.result.length || e.loaded
        if (e.target.error !== null || chkLength === undefined) { // An error occurred
          this.error(null, e.target.error)
          return false
        } else if (this.offset >= this.file.size) { // File totally read
          this.success()
          return true
        }
        // Handle current chunk and read next
        this.offset += chkLength
        this.handleChunk(e.target.result)
        readChunk()
      }
      r.readAsArrayBuffer(blob)
    }
    readChunk()
  }

  success () {
    if (this.halt) return false
    // Waiting end of the uploading process
    let timer = setInterval(() => {
      if (debug) console.log('Waiting...')
      if (this.chWritten >= this.chRead) { // Done, write "EOF" at the end of file
        clearInterval(timer)
        vue.$http.post('files/write', {filename: this.dest_filename, folder_id: this.dest_folder, data: 'EOF'}).then((res) => {
          /*
          if(typeof(me.callback) !== 'function') {
            Folders.open(me.folder_id);
          }
          */
        }, (res) => {
          this.error()
        })
      }
    }, 1000)
  }

  handleChunk (chunk) {
    if (this.halt) return false
    this.chRead++
    if (this.start < this.chRead) {
      // Encrypt it
      chunk = new Uint8Array(chunk)
      chunk = this.toBitArrayCodec(chunk)
      // var chk_length = me.encryptChk(chk, this.chRead);
      // if(debug) console.log(me.file.name+' - Part '+this.chRead+' size : '+chk_length);
    } else {
      this.chWritten++
      this.bWritten += Math.round(chunkSize * this.est)
      let pct = this.bWritten / this.est_size * 100
      if (pct > 100) pct = 100

      console.log('Did not write part ' + this.chRead)
    }
  }

  complete (line) {
    if (yesCompleteAll) {
      this.read(line)
    } else if (yesReplaceAll) {
      // TODO - rm + start reading at 0
    } else if (!noAll) {
      // TODO
    } else {
      this.abort()
    }
  }

  replace () {
    if (yesReplaceAll) {
      // TODO - rm + start reading at 0
    } else if (!noAll) {
      // TODO
    } else {
      this.abort()
    }
  }

  checkStatus () {
    vue.$http.post('files/status', {filename: this.dest_filename, folder_id: this.dest_folder, filesize: this.file.size}).then((res) => {
      if (typeof res.body.data.status !== 'undefined') {
        switch (res.body.data.status) {
          case 0: // Not exists
            this.read()
            break
          case 1: // Not completed
            this.complete(res.body.data.line)
            break
          case 2: // Completed
            this.replace()
            break
          default:
            this.error()
        }
      } else {
        this.error()
      }
    }, (res) => {
      this.halt = true
      if (res.body.message === 'quota') {
        this.error('User.quotaExceeded')
      } else {
        this.error()
      }
    })
  }

  toBitArrayCodec (bytes) {
    // Convert from an array of bytes to a bitArray
    let out = []
    let i
    let tmp = 0
    for (i = 0; i < bytes.length; i++) {
      tmp = tmp << 8 | bytes[i]
      if ((i & 3) === 3) {
        out.push(tmp)
        tmp = 0
      }
    }
    if (i & 3) {
      out.push(sjcl.bitArray.partial(8 * (i & 3), tmp))
    }
    return out
  }

  error (msg, msg2) {
    console.log('Error', msg, msg2)
    bus.$emit('TransfersSetError', 'upload', this.id, msg)
  }

  abort () {
    // Abort encryption process
    this.halt = true
    console.log('abort ' + this.file.name)
  }
}

class Upload {
  constructor () {
    this.enc = []
  }

  checkAPI () {
    return window.File && window.FileReader && window.FileList && window.Blob
  }

  upFiles (files, v) {
    vue = v
    if (!this.checkAPI()) {
      alert(vue.$t('User.fileAPI'))
      return false
    }
    store.folder.transfers = true
    bus.$emit('SidebarOpenTransfers')

    yesReplaceAll = false
    yesCompleteAll = false
    noAll = false

    for (let i = 0; i < files.length; i++) {
      this.enc.push(new Encryption(files[i], store.folder.folder_id, this.enc.length))
    }
  }

  abort (id) {
    this.enc[id].abort()
  }
}

export default new Upload()
