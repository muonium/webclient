<template>
  <div class="container-large">
    <vue-headful
      v-if="!this.$parent.loading"
      :title="$t('Global.profile')"
    />
    <div class="info mono">
      {{ $t('Profile.upgrade') }}
      <router-link to="/upgrade">{{ $t('Profile.getMore') }}</router-link>
    </div><br>

    <h1>{{ $t('Sidebar.settings') }}</h1>
    <fieldset>
      <legend>{{ $t('Global.profile') }}</legend>
      <p>
        <span class="label">{{ $t('Register.login') }}:</span>
        <span id="username">{{ this.login }}</span>
      </p>
      <p>
        <span class="label">{{ $t('Register.email') }}:</span>
        <span id="email">{{ this.email }}</span>
      </p>
      <p>
        <span class="label">ID:</span>
        {{ this.id }}
      </p>
    </fieldset>

    <fieldset>
      <legend>{{ $t('Profile.mailUsername') }}</legend>
      <div class="bloc-input">
        <div>
          <form>
            <h3>{{ $t('Profile.changeLogin') }}</h3>
            <p class="input-large">
              <input type="text" id="new_login" :placeholder="$t('Profile.newLogin')" v-model="fields.changeLogin.login" @focus="reset('changeLoginReturn')" required>
              <label class="fa fa-user" for="new_login" aria-hidden="true"></label>
            </p>
            <div v-if="this.changeLoginReturn" class="preturn">{{ $t(this.changeLoginReturn) }}</div>
            <input type="submit" class="btn btn-required btn-profile" @click.prevent="changeLogin" :value="$t('Global.submit')" :disabled="!isComplete('changeLogin')">
          </form>
        </div>
        <div>
          <form>
            <h3>{{ $t('Profile.changeMail') }}</h3>
            <p class="input-large">
              <input type="text" id="new_mail" :placeholder="$t('Profile.changeMail')" v-model="fields.changeMail.mail" @focus="reset('changeMailReturn')" required>
              <label class="fa fa-envelope" for="new_mail" aria-hidden="true"></label>
            </p>
            <div v-if="this.changeMailReturn" class="preturn">{{ $t(this.changeMailReturn) }}</div>
            <input type="submit" class="btn btn-required btn-profile" @click.prevent="changeMail" :value="$t('Global.submit')" :disabled="!isComplete('changeMail')">
          </form>
        </div>
      </div>
    </fieldset>

    <fieldset>
      <legend>{{ $t('Profile.pwdPp') }}</legend>
      <div class="bloc-input">
        <div>
          <form>
            <h3>{{ $t('Profile.changePwd') }}</h3>
            <p class="input-large">
              <input type="password" id="old_pwd" :placeholder="$t('Profile.oldPwd')" v-model="fields.changePassword.old_pwd" @focus="reset('changePasswordReturn')" required>
              <label class="fa fa-lock" for="old_pwd" aria-hidden="true"></label>
            </p>
            <p class="input-large">
              <input type="password" id="new_pwd" :placeholder="$t('Profile.newPwd')" v-model="fields.changePassword.new_pwd" @focus="reset('changePasswordReturn')" required>
              <label class="fa fa-lock" for="new_pwd" aria-hidden="true"></label>
            </p>
            <p class="input-large">
              <input type="password" id="pwd_confirm" :placeholder="$t('Register.confirm')" v-model="fields.changePassword.pwd_confirm" @focus="reset('changePasswordReturn')" required>
              <label class="fa fa-lock" for="pwd_confirm" aria-hidden="true"></label>
            </p>
            <div v-if="this.changePasswordReturn" class="preturn">{{ $t(this.changePasswordReturn) }}</div>
            <input type="submit" class="btn btn-required btn-profile" @click.prevent="changePassword" :value="$t('Global.submit')" :disabled="!isComplete('changePassword')">
          </form>
        </div>
        <div>
          <form>
            <h3>{{ $t('Profile.changePp') }}</h3>
            <p class="input-large">
              <input type="password" id="old_pp" :placeholder="$t('Profile.oldPp')" v-model="fields.changeCek.old_pp" @focus="reset('changeCekReturn')" required>
              <label class="fa fa-lock" for="old_pp" aria-hidden="true"></label>
            </p>
            <p class="input-large">
              <input type="password" id="new_pp" :placeholder="$t('Profile.newPp')" v-model="fields.changeCek.new_pp" @focus="reset('changeCekReturn')" required>
              <label class="fa fa-lock" for="new_pp" aria-hidden="true"></label>
            </p>
            <p class="input-large">
              <input type="password" id="pp_confirm" :placeholder="$t('Register.confirm')" v-model="fields.changeCek.pp_confirm" @focus="reset('changeCekReturn')" required>
              <label class="fa fa-lock" for="pp_confirm" aria-hidden="true"></label>
            </p>
            <div v-if="this.changeCekReturn" class="preturn">{{ $t(this.changeCekReturn) }}</div>
            <input type="submit" class="btn btn-required btn-profile" @click.prevent="changeCek" :value="$t('Global.submit')" :disabled="!isComplete('changeCek')">
          </form>
        </div>
      </div>
    </fieldset>

    <fieldset>
      <legend>{{ $t('Profile.otherOptions') }}</legend>
      <h3>{{ $t('Profile.theme') }}</h3>
      <p class="input-large">
        <input type="radio" name="theme" id="light" @click="switchTheme('light')" :checked="$parent.theme === 'light'">
        <label for="light">Light</label>

        <input type="radio" name="theme" id="dark" @click="switchTheme('dark')" :checked="$parent.theme === 'dark'">
        <label for="dark">Dark</label>
      </p>
    </fieldset>

    <fieldset>
      <h3>{{ $t('Profile.doubleAuth') }}</h3>
      <p class="input-large">
        <input type="radio" name="2fa" id="2fa_0" :checked="doubleAuth === 0">
        <label for="2fa_0" @click.prevent="switchAuth(0)">{{ $t('Profile.2fa_0') }}</label>

        <input type="radio" name="2fa" id="2fa_1" :checked="doubleAuth === 1">
        <label for="2_fa1" @click.prevent="switchAuth(1)">{{ $t('Profile.2fa_1') }}</label>

        <input type="radio" name="2fa" id="2fa_2" :checked="doubleAuth === 2">
        <label for="2fa_2" @click.prevent="switchAuth(2)">{{ $t('Profile.2fa_2') }}</label>
      </p>
      <div v-if="this.changeAuthReturn">{{ $t(this.changeAuthReturn) }}</div>
    </fieldset>

    <fieldset>
      <h3>{{ $t('Profile.lang') }}</h3>
      <languageSelector/>
    </fieldset>

    <fieldset>
      <h3>{{ $t('Profile.sessions') }}</h3>
      <div class="sessions">
        <table>
          <tr v-for="(session, index) in this.sessions" :key="'session-' + index" :class="session.current ? 'current' : ''">
            <td>{{ session.jti.substr(0, 8) }}</td>
            <td>{{ utils.getDate(session.iat) }}</td>
            <td><a href="#" @click.prevent="terminate(index)" v-if="!session.current">{{ $t('Profile.terminate') }}</a></td>
          </tr>
        </table>
      </div>
      <p v-if="this.sessions.length > 1">
        <input type="button" class="btn btn-warning" :value="$t('Profile.terminateAll')" @click.prevent="terminateAll">
      </p>
    </fieldset>

    <fieldset>
      <form>
        <h3>{{ $t('Profile.deleteAccount') }}</h3>
        <p class="input-large">
          <input type="checkbox" id="delete" v-model="deleteCheckbox" required>
          <label for="delete">{{ $t('Profile.iwant') }}</label>
        </p>
        <div v-if="this.confirmDeleteReturn" class="preturn">{{ $t(this.confirmDeleteReturn) }}</div>
        <input type="submit" class="btn btn-required btn-warning" @click.prevent="confirmDelete" :value="$t('Profile.deleteAccount')" :disabled="!deleteCheckbox">
      </form>
    </fieldset>

    <messageBox ref="messageBox"/>
  </div>
</template>

<script>
import utils from '../utils'
import messageBox from './messageBox'
import sjcl from 'sjcl'
import base64 from 'hi-base64'
import muiHash from '../mui_hash'
import languageSelector from './language_selector'

export default {
  name: 'Profile',
  components: {
    messageBox, languageSelector
  },
  data () {
    return {
      id: null,
      login: null,
      email: null,
      doubleAuth: 0,
      deleteCheckbox: false,
      sessions: [],
      fields: {
        changeLogin: {
          login: ''
        },
        changeMail: {
          mail: ''
        },
        changePassword: {
          old_pwd: '',
          new_pwd: '',
          pwd_confirm: ''
        },
        changeCek: {
          old_pp: '',
          new_pp: '',
          pp_confirm: ''
        }
      },
      changeLoginReturn: null,
      changeMailReturn: null,
      changePasswordReturn: null,
      changeCekReturn: null,
      changeAuthReturn: null,
      confirmDeleteReturn: null
    }
  },
  methods: {
    changeLogin () {
      this.$http.post('user/changeLogin', {login: this.fields.changeLogin.login}).then((res) => {
        this.login = this.fields.changeLogin.login
        this.changeLoginReturn = 'Profile.updateOk'
      }, (res) => {
        this.changeLoginReturn = 'Profile.updateErr'
        switch (res.body.message) {
          case 'loginExists':
            this.changeLoginReturn = 'Profile.loginExists'
            break
          case 'loginFormat':
            this.changeLoginReturn = 'Register.loginFormat'
        }
      })
    },
    changeMail () {
      this.$http.post('user/changeMail', {mail: this.fields.changeMail.mail}).then((res) => {
        this.email = this.fields.changeMail.mail
        this.changeMailReturn = 'Profile.updateOk'
      }, (res) => {
        this.changeMailReturn = 'Profile.updateErr'
        switch (res.body.message) {
          case 'mailExists':
            this.changeMailReturn = 'Profile.mailExists'
            break
          case 'mailFormat':
            this.changeMailReturn = 'Profile.mailFormat'
        }
      })
    },
    changePassword () {
      if (this.fields.changePassword.new_pwd.length < 6) {
        this.changePasswordReturn = 'Register.passLength'
      } else if (this.fields.changePassword.new_pwd !== this.fields.changePassword.pwd_confirm) {
        this.changePasswordReturn = 'Register.badPassConfirm'
      } else {
        this.$http.post('user/changePassword', {old_pwd: muiHash(this.fields.changePassword.old_pwd), new_pwd: muiHash(this.fields.changePassword.new_pwd)}).then((res) => {
          this.changePasswordReturn = 'Profile.updateOk'
        }, (res) => {
          if (res.body.message === 'badOldPass') {
            this.changePasswordReturn = 'Profile.badOldPass'
          } else {
            this.changePasswordReturn = 'Profile.updateErr'
          }
        })
      }
    },
    changeCek () {
      let currentCek = sessionStorage.getItem('cek')
      let currentKek = sessionStorage.getItem('kek')
      let newKek = this.fields.changeCek.new_pp
      if (this.fields.changeCek.old_pp !== currentKek) {
        this.changeCekReturn = 'Profile.badOldPassphrase'
      } else if (newKek.length < 6) {
        this.changeCekReturn = 'Register.passLength'
      } else if (newKek !== this.fields.changeCek.pp_confirm) {
        this.changeCekReturn = 'Register.badPassphraseConfirm'
      } else {
        // crypto parameters
        let a = sjcl.random.randomWords(4) // authentication data - 128 bits
        let i = sjcl.random.randomWords(4) // initialization vector - 128 bits
        let s = sjcl.random.randomWords(4) // salt - 128 bits
        // encrypt it
        let newCek = sjcl.encrypt(newKek, currentCek, {
          mode: 'gcm', iv: i, salt: s, iter: 7000, ks: 256, adata: a, ts: 128
        })
        newCek = base64.encode(newCek) // don't store a Json in DB...

        this.$http.post('user/changeCek', {cek: newCek}).then((res) => {
          sessionStorage.setItem('cek', newCek)
          sessionStorage.setItem('kek', newKek)
          this.changeCekReturn = 'Profile.updateOk'
        }, (res) => {
          this.changeCekReturn = 'Profile.updateErr'
        })
      }
    },
    switchTheme (theme) {
      this.$parent.theme = theme
      localStorage.setItem('theme', theme)
      document.querySelector('#theme').href = this.$parent.base + (theme === 'dark' ? 'static/css/2018/dark.css' : 'static/css/2018/light.css')
    },
    switchAuth (type) {
      if (type !== this.doubleAuth && type >= 0 && type <= 2) {
        this.$http.post('user/changeAuth', {doubleAuth: type}).then((res) => {
          this.doubleAuth = type
          this.changeAuthReturn = 'Profile.updateOk'
        }, (res) => {
          this.changeAuthReturn = 'Profile.updateErr'
        })
      }
    },
    confirmDelete () {
      let del = (e, yes) => {
        let index = this.$refs.messageBox.getIndexFromEvent(e)
        if (index !== false) {
          this.$refs.messageBox.close(index)
          if (yes) {
            this.$http.delete('user').then((res) => { // Deleted
              this.$parent.logout()
            }, (res) => { // Error
              this.confirmDeleteReturn = 'Profile.updateErr'
            })
          }
        }
      }
      if (!this.$refs.messageBox.hasType('delete')) {
        this.$refs.messageBox.add({
          type: 'delete',
          title: this.$t('Profile.accountDeletionConfirm'),
          txt: '<p class="warning">' + this.$t('Profile.deleteWarning') + '</p>',
          btns: [
            {type: 'button', class: 'btn btn-warning', value: 'OK', style: 'float:left', clickEvent: (e) => del(e, true)},
            {type: 'button', class: 'btn btn', value: this.$t('Global.cancel'), clickEvent: (e) => del(e, false)}
          ]
        })
      }
    },
    terminate (index) {
      if (typeof this.sessions[index] !== 'undefined') {
        this.$http.delete('session/jti/' + this.sessions[index].jti.replace(/\+/g, '-').replace(/\//g, '_')).then((res) => { // base64url
          this.$delete(this.sessions, index)
        }, (res) => {
          console.log(res)
        })
      }
    },
    terminateAll () {
      this.$http.delete('session/all').then((res) => {
        this.sessions = this.sessions.filter(session => session.current)
      }, (res) => {
        console.log(res)
      })
    },
    reset (v) {
      this[v] = null
    },
    isComplete (section) {
      let complete = true
      for (let key of Object.keys(this.fields[section])) {
        if (this.fields[section][key] === '') {
          complete = false
          break
        }
      }
      return complete
    }
  },
  computed: {
    utils () {
      return utils
    }
  },
  created () {
    if (!this.$parent.isLogged()) {
      this.$parent.logout()
      return false
    }

    this.$http.get('user').then((res) => {
      this.id = res.body.data.id
      this.login = res.body.data.login
      this.email = res.body.data.email
      this.doubleAuth = res.body.data.double_auth
    }, (res) => {
      // Error
      this.$parent.logout()
    })

    this.$http.get('session').then((res) => {
      this.sessions = res.body.data.tokens
    }, (res) => {
      console.log(res)
    })
  },
  mounted () {
    // Show sidebar and selection div
    this.$parent.sidebar = true
  },
  beforeDestroy () {
    this.$parent.sidebar = false
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.preturn { margin-bottom: 10px; }
.sessions {
  display: inline-block;
  margin-top: 24px;
  margin-bottom: 14px;
  max-height: 250px;
  overflow-y: auto;
  font-weight: normal;
}
.sessions tr.current { font-weight: bold; }
.sessions td { padding: 5px 10px; }
.sessions td:first-child, .sessions td:last-child { padding: 5px 15px; }
.sessions tr td:last-child { opacity: 0; }
.sessions tr:hover td:last-child, .sessions tr:active td:last-child { opacity: 1; }
</style>
