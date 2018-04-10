import store from './store'
import bus from './bus'
import rm from './rm'
import sjcl from 'sjcl'

let vue = {}
let chunkSize = 512 * 1024 // Size of one chunk in B
let debug = true

let yesReplaceAll = false
let yesCompleteAll = false
let noAll = false

class Encryption {
  constructor (file, destFolder, id, open) {
    this.cek = sessionStorage.getItem('cek')
    this.est = 1.335 // Estimation of the difference between the file and encrypted file
    this.yes = false
    this.halt = false

    if (this.cek === null) return false

    this.salt = sjcl.random.randomWords(4) // crypto parameter: salt - 128 bits long
    this.key = sjcl.misc.pbkdf2(this.cek, this.salt, 7000, 256) // key derivation
    this.enc = new sjcl.cipher.aes(this.key) // eslint-disable-line new-cap

    this.file = file
    this.dest_filename = file.name.replace(/<\/?[^>]+(>|$)/g, '')
    this.dest_folder = destFolder
    this.id = id
    this.open = open
    this.est_size = Math.round(file.size * this.est) // Estimation of encrypted file size

    this.start = 0 // Start to write at chunk x
    this.chRead = 0 // Number of chunks read
    this.chWritten = 0 // Number of chunks written
    this.bWritten = 0 // Number of B written
    this.offset = 0

    vue.$set(store.transfers.upload, this.id, {
      name: this.dest_filename,
      pct: 0,
      error: false,
      error_msg: null
    })
    if (debug) console.log('Transfers ID: ' + this.id)

    this.checkStatus() // Once initialized, check status before uploading
  }

  complete (line) {
    let completeFile = true // Initial state
    let btnCallback = (e, yes) => {
      let index = vue.$refs.messageBox.getIndexFromEvent(e)
      if (index !== false) {
        this.yes = yes
        vue.$refs.messageBox.close(index)

        if (this.yes) {
          if (completeFile) {
            this.read(line)
          } else {
            rm.rmFromFilename(this.dest_filename, () => this.read())
          }
        } else {
          this.abort()
        }
      }
    }

    if (yesCompleteAll) {
      this.read(line)
    } else if (yesReplaceAll) {
      rm.rmFromFilename(this.dest_filename, () => this.read())
    } else if (!noAll) {
      let btns = [
        {
          type: 'button',
          class: 'btn',
          value: vue.$t('Transfers.yes'),
          clickEvent (e) {
            btnCallback(e, true)
          }
        }
      ]
      if (!this.open) {
        btns.push({
          type: 'button',
          class: 'btn',
          value: vue.$t('Transfers.yesAll'),
          clickEvent (e) {
            if (completeFile) {
              yesCompleteAll = true
            } else {
              yesReplaceAll = true
            }
            btnCallback(e, true)
          }
        })
      }
      btns.push({
        type: 'button',
        class: 'btn',
        value: vue.$t('Transfers.no'),
        clickEvent (e) {
          btnCallback(e, false)
        }
      })
      if (!this.open) {
        btns.push({
          type: 'button',
          class: 'btn',
          value: vue.$t('Transfers.noAll'),
          clickEvent (e) {
            noAll = true
            btnCallback(e, false)
          }
        })
      }
      vue.$refs.messageBox.add({
        title: vue.$t('Transfers.replaceCompleteFile').replace('[filename]', this.dest_filename),
        toggles: [
          {
            leftTxt: vue.$t('Transfers.complete'),
            rightTxt: vue.$t('Transfers.replace'),
            clickEvent (e) {
              completeFile = !e.target.checked
            }
          }
        ],
        btns: btns
      })
    } else {
      this.abort()
    }
  }

  replace () {
    let btnCallback = (e, yes) => {
      let index = vue.$refs.messageBox.getIndexFromEvent(e)
      if (index !== false) {
        this.yes = yes
        vue.$refs.messageBox.close(index)

        if (this.yes) {
          rm.rmFromFilename(this.dest_filename, () => this.read())
        } else {
          this.abort()
        }
      }
    }

    if (yesReplaceAll) {
      rm.rmFromFilename(this.dest_filename, () => this.read())
    } else if (!noAll) {
      let btns = [
        {
          type: 'button',
          class: 'btn',
          value: vue.$t('Transfers.yes'),
          clickEvent (e) {
            btnCallback(e, true)
          }
        }
      ]
      if (!this.open) { // Not the last file
        btns.push({
          type: 'button',
          class: 'btn',
          value: vue.$t('Transfers.yesAll'),
          clickEvent (e) {
            yesReplaceAll = true
            btnCallback(e, true)
          }
        })
      }
      btns.push({
        type: 'button',
        class: 'btn',
        value: vue.$t('Transfers.no'),
        clickEvent (e) {
          btnCallback(e, false)
        }
      })
      if (!this.open) { // Not the last file
        btns.push({
          type: 'button',
          class: 'btn',
          value: vue.$t('Transfers.noAll'),
          clickEvent (e) {
            noAll = true
            btnCallback(e, false)
          }
        })
      }
      vue.$refs.messageBox.add({
        title: vue.$t('Transfers.replaceFile').replace('[filename]', this.dest_filename),
        btns: btns
      })
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
        this.error('Transfers.quotaExceeded')
      } else {
        this.error()
      }
    })
  }

  read (start = 0) {
    this.start = start
    if (debug) console.log('start reading')

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
        this.chRead++
        this.offset += chkLength
        this.handleChunk(this.chRead, e.target.result)
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
          if (this.open) {
            bus.$emit('FolderOpen')
          }
        }, (res) => {
          this.error()
        })
      }
    }, 1000)
  }

  handleChunk (chunkNb, chunkContent) {
    if (this.halt) return false
    if (this.start < chunkNb) {
      // Encrypt it
      chunkContent = new Uint8Array(chunkContent)
      chunkContent = this.toBitArrayCodec(chunkContent)
      if (debug) console.log('Starting encryption of part ' + chunkNb)

      let pack = (c, s, a, i) => { // ciphered_chk, salt, authentification data, initialization vector
        let t = []
        t.push(sjcl.codec.base64.fromBits(c))
        t.push(sjcl.codec.base64.fromBits(s))
        t.push(sjcl.codec.base64.fromBits(a))
        t.push(sjcl.codec.base64.fromBits(i))
        return t.join(':')
      }

      // crypto parameter
      let initVector = sjcl.random.randomWords(4)
      let aDATA = sjcl.random.randomWords(4)

      // chunk encryption
      let s = pack(
        sjcl.mode.gcm.encrypt(this.enc, chunkContent, initVector, aDATA, 128),
        this.salt,
        aDATA,
        initVector
      ) // eslint-disable-line no-unused-vars

      // Avoiding chunk sent before previous chunk if encryption is faster
      let timer = setInterval(() => {
        if (chunkNb === this.chWritten + 1) {
          clearInterval(timer)
          vue.$http.post('files/write', {filename: this.dest_filename, folder_id: this.dest_folder, data: s}).then((res) => {
            this.chWritten++
            this.bWritten += s.length
            this.updatePct()
          }, (res) => {
            this.chWritten++
            // Quota exceeded or unable to write
            this.abort()
            return false
          })
        }
      }, 250)
    } else {
      this.chWritten++
      this.bWritten += Math.round(chunkSize * this.est)
      this.updatePct()
      if (debug) console.log('Did not write part ' + chunkNb)
    }
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

  updatePct () {
    let pct = Math.round(this.bWritten / this.est_size * 100)
    let row = store.transfers.upload[this.id]
    if (typeof row !== 'undefined') {
      row.pct = pct > 100 ? 100 : pct
      vue.$set(store.transfers.upload, this.id, row)
      if (row.pct === 100) {
        setTimeout(() => {
          vue.$delete(store.transfers.upload, this.id)
        }, 800)
      }
    }
  }

  error (msg = '', msg2 = '') {
    if (debug) console.log('Error', msg, msg2)
    bus.$emit('TransfersSetError', 'upload', this.id, msg)
  }

  abort () {
    // Abort encryption process
    this.halt = true
    vue.$delete(store.transfers.upload, this.id)
    if (debug) console.log('aborted ' + this.file.name)
  }
}

class Upload {
  constructor () {
    this.enc = []
  }

  checkAPI () {
    return window.File && window.FileReader && window.FileList && window.Blob
  }

  upFiles (data, v, items) { // items is optionnal, used for webkit folder detection
    vue = v
    if (!this.checkAPI()) {
      alert(vue.$t('Transfers.fileAPI'))
      return false
    }
    store.folder.transfers = true
    store.transfers.upSelected = true
    bus.$emit('SidebarOpenTransfers')

    yesReplaceAll = false
    yesCompleteAll = false
    noAll = false

    let files = []
    for (let i = 0; i < data.length; i++) {
      // Folder detection
      if (typeof data[i].type !== 'undefined' && data[i].type !== null && data[i].type.length > 0) {
        files.push(data[i])
      } else {
        if (items !== undefined && items !== null && typeof items[i].webkitGetAsEntry === 'function') { // Chrome, Edge, Firefox 50+
          let entry = items[i].webkitGetAsEntry()
          if (entry.isDirectory) {
            continue
          }
        } else { // Try with FileReader but does not always detect a folder
          try {
            new FileReader().readAsBinaryString(data[i].slice(0, 5))
          } catch (e) { // could not access contents, is a directory, skip
            continue
          }
        }
        files.push(data[i])
      }
    }

    for (let j = 0; j < files.length; j++) {
      let open = j === files.length - 1
      this.enc.push(new Encryption(files[j], store.folder.folder_id, this.enc.length, open))
    }
  }

  abort (id) {
    this.enc[id].abort()
  }
}

export default new Upload()
