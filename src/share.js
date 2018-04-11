import bus from './bus'
import store from './store'
import utils from './utils'
import sjcl from 'sjcl'

class Share {
  constructor () {
    this.vue = {}
  }

  share (id) {
    let files = []
    let cek = sessionStorage.getItem('cek')
    let ready = false
    if (store.selection.files.length > 0) {
      files = store.selection.files
    } else {
      files = [id]
    }

    let validate = (e) => {
      if (e.type === 'keyup' && e.keyCode !== 13) {
        if ((!ready && e.target.value.length >= 6) || (ready && e.target.value.length < 6)) {
          ready = !ready
          let el = e.target
          while (el) {
            if (el.classList.contains('MessageBox')) {
              el.querySelector('.MessageBoxBtns input').disabled = !ready
              break
            }
            el = el.parentElement
          }
        }
      }
      if (ready && (e.type === 'click' || e.keyCode === 13)) {
        let index = this.vue.$refs.messageBox.getIndexFromEvent(e)
        if (index !== false) {
          let passphrase = document.querySelector('.MessageBox[data-index="' + index + '"] input[name="passphrase"]').value
          this.vue.$refs.messageBox.close(index)
          for (let file of files) {
            let el = document.querySelector('#f' + file)
            if (el) {
              this.vue.$http.post('files/chunk', {filename: utils.htmlspecialcharsDecode(el.getAttribute('data-title')), folder_id: store.folder.folder_id, line: 0}).then((res) => {
                // Get the first chunk
                let chk = res.body.data.split(':')
                if (chk.length === 4) {
                  let pack = (e, s, a, i) => { // encFek, salt, authentification data, initialization vector
                    let t = []
                    t.push(sjcl.codec.base64.fromBits(e))
                    t.push(sjcl.codec.base64.fromBits(s))
                    t.push(sjcl.codec.base64.fromBits(a))
                    t.push(sjcl.codec.base64.fromBits(i))
                    return t.join(':')
                  }

                  let fSalt = sjcl.codec.base64.toBits(chk[1])
                  let fek = sjcl.misc.pbkdf2(cek, fSalt, 7000, 256) // Key derivation

                  let salt = sjcl.random.randomWords(4)
                  let initVector = sjcl.random.randomWords(4)
                  let aDATA = sjcl.random.randomWords(4)

                  // Password derivation to get dk
                  let dk = sjcl.misc.pbkdf2(passphrase, salt, 7000, 256)
                  let enc = new sjcl.cipher.aes(dk) // eslint-disable-line new-cap

                  // Package
                  let p = pack(
                    sjcl.mode.gcm.encrypt(enc, fek, initVector, aDATA, 128),
                    salt,
                    aDATA,
                    initVector
                  )

                  this.vue.$http.post('share', {id: file, dk: p}).then((res) => {
                    el.setAttribute('data-shared', '1')
                    if (files.length === 1) {
                      this.vue.$refs.messageBox.add({
                        title: this.vue.$t('Tree.shared'),
                        inputs: [
                          {
                            type: 'text',
                            class: 'copy_url',
                            autocomplete: 'off',
                            value: res.body.data,
                            style: 'width:100%'
                          }
                        ],
                        btns: [
                          {
                            type: 'button',
                            class: 'btn',
                            value: this.vue.$t('Selection.copy'),
                            clickEvent: (e) => {
                              let index = this.vue.$refs.messageBox.getIndexFromEvent(e)
                              if (index !== false) {
                                document.querySelector('.MessageBox[data-index="' + index + '"] input.copy_url').select()
                                document.execCommand('copy')
                                this.vue.$refs.messageBox.close(index)
                              }
                            }
                          }
                        ]
                      })
                    }
                  }, (res) => {
                    console.log(res)
                  })
                }
              }, (res) => {
                console.log(res)
              })
            }
          }
        }
      }
      return true
    }

    this.vue.$refs.messageBox.add({
      title: this.vue.$t('Register.passphrase'),
      inputs: [
        {
          type: 'text',
          name: 'passphrase',
          id: 'nShare',
          placeholder: this.vue.$t('Register.passphrase'),
          autocomplete: 'off',
          autofocus: true,
          icon: 'fa fa-lock',
          keyUpEvent (e) {
            validate(e)
          }
        }
      ],
      btns: [
        {
          type: 'button',
          class: 'btn',
          value: this.vue.$t('Tree.generateLink'),
          disabled: true,
          clickEvent (e) {
            validate(e)
          }
        }
      ]
    })
  }

  unshare (id) {
    let files = []
    if (store.selection.files.length > 0) {
      files = store.selection.files
    } else {
      files = [id]
    }

    for (let file of files) {
      this.vue.$http.delete('share/id/' + file).then((res) => {
        let el = document.querySelector('#f' + file)
        if (el) el.setAttribute('data-shared', '0')
      }, (res) => {
        console.log(res)
      })
    }
    bus.$emit('SelectionRemoveAll')
  }
}

export default new Share()
