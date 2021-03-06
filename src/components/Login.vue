<template>
  <div class="container-small">
    <vue-headful
      v-if="!this.$parent.loading"
      :title="$t('Global.login')"
    />
    <div class="info green" v-if="this.val">{{ $t('Validate.done') }}</div>

    <form class="form-login" method="post" v-on:submit.prevent="sendCredentials" v-if="login_form">
      <h1>{{ $t('Global.login') }}</h1>

      <p class="input-large">
        <input type="text" id="field_username" :placeholder="$t('Login.username')" v-model="fields.username" ref="login" required v-focus>
        <label class="fa fa-user" for="field_username" aria-hidden="true"></label>
      </p>

      <p class="input-large">
        <input type="password" id="field_password" :placeholder="$t('Register.password')" v-model="fields.password" required>
        <label class="fa fa-lock" for="field_password" aria-hidden="true"></label>
      </p>

      <div class="bloc-links">
        <router-link to="lostPass" class="mono blue">{{ $t('Login.forgot') }}</router-link>
        <input type="submit" class="btn btn-required" :value="$t('Login.signIn')" :disabled="!isComplete">
      </div>

      <router-link to="/register" class="mono center">{{ $t('Login.register') }}</router-link>

      <div class="mtop" v-if="!server_form">
        <a href="#" @click.prevent="toggleChangeServer">{{ $t('Login.server') }}</a>
      </div>

      <div class="right" v-if="server_form">
        <p class="input-large">
          <input type="text" id="field_url" placeholder="URL" v-model="server_url" required>
          <label class="fa fa-server" for="field_url" aria-hidden="true"></label>
        </p>
        <input type="button" class="btn" value="OK" @click.prevent="toggleChangeServer" :disabled="!isUrl">
      </div>
    </form>

    <form method="post" v-on:submit.prevent="sendPassphrase" v-else-if="passphrase_form">
      <h1>{{ $t('Global.login') }}</h1>

      <p class="input-large">
        <input type="password" id="field_passphrase" :placeholder="$t('Register.passphrase')" v-model="fields.passphrase" ref="passphrase" required>
        <label class="fa fa-lock" for="field_passphrase" aria-hidden="true"></label>
      </p>
      <input type="submit" class="btn btn-required" :value="$t('Login.signIn')" :disabled="!isComplete">
    </form>

    <form method="post" v-on:submit.prevent="sendCode" v-else>
      <h1>{{ $t('Global.login') }}</h1>

      <p class="input-large">
        <input type="text" name="code" class="noicon" :placeholder="$t('Login.code')" v-model="fields.code" ref="code" required>
      </p>
      <input type="submit" class="btn" :value="$t('Global.submit')" :disabled="!isComplete">
    </form>

    <p class="red return" v-if="this.err_msg">{{ $t(this.err_msg) }}</p>
    <p class="green return" v-if="this.success_msg">{{ $t(this.success_msg) }}</p>
    <img src="../assets/img/index/loader.svg" class="loader" v-if="loading">
  </div>
</template>

<script>
import sjcl from 'sjcl'
import base64 from 'hi-base64'
import muiHash from '../mui_hash'
import Vue from 'vue'
import validUrl from 'valid-url'

export default {
  name: 'Login',
  data () {
    return {
      val: false,
      loading: false,
      err_msg: null,
      success_msg: null,
      login_form: true,
      passphrase_form: false,
      server_form: false,
      server_url: null,
      doubleAuthMethod: 1,
      uid: null,
      cek: null,
      fields: {
        username: '',
        password: '',
        passphrase: '',
        code: ''
      }
    }
  },
  methods: {
    sendCredentials () {
      this.success_msg = null
      if (this.fields.username.length > 2 && this.fields.password.length > 5) {
        this.loading = true
        this.err_msg = null
        this.$http.post('session', {username: this.fields.username, password: muiHash(this.fields.password)}).then((res) => {
          this.loading = false
          if (res.body.data !== null && typeof res.body.data.cek !== 'undefined') {
            this.cek = base64.decode(decodeURIComponent(res.body.data.cek))
            // Apply user language
            if (typeof res.body.data.lang !== 'undefined') {
              if (!(res.body.data.lang in this.$i18n.messages)) {
                this.$parent.loadLanguage(res.body.data.lang, true)
                localStorage.setItem('lang', res.body.data.lang)
              }
            }

            if (res.body.message === 'doubleAuth') {
              this.doubleAuthMethod = res.body.data.doubleAuthMethod
              this.uid = res.body.data.uid
              this.changeForm('code')
            } else if (res.body.message === 'wait') {
              this.doubleAuthMethod = 1
              this.uid = res.body.data.uid
              this.err_msg = 'Login.wait'
              this.changeForm('code')
            } else {
              this.$parent.token = res.body.token
              this.changeForm('passphrase')
            }
          } else {
            this.err_msg = 'Error.default'
          }
        }, (res) => {
          this.loading = false
          this.err_msg = 'Error.default'
          if (res.body.code === 401) {
            if (res.body.message === 'badUser') {
              this.err_msg = 'LostPass.notFound'
            } else if (res.body.message === 'badPass') {
              this.err_msg = 'Login.badPass'
            } else if (res.body.message === 'validate') {
              this.$router.push({path: '/validate/' + res.body.data})
            }
          }
        })
      } else {
        this.err_msg = 'Register.form'
      }
    },
    sendPassphrase () {
      if (this.fields.passphrase.length > 0) {
        let fail = false
        let cek = null
        try { // we try to decrypt the CEK with the passphrase
          cek = sjcl.decrypt(this.fields.passphrase, this.cek) // the CEK is now a JSON, we decrypt it
        } catch (e) { // the passphrase is wrong
          fail = true
          this.err_msg = 'Login.badPassphrase'
        }
        if (!fail) {
          this.success_msg = 'Login.success'
          sessionStorage.setItem('kek', this.fields.passphrase) // we store locally the passphrase
          sessionStorage.setItem('cek', cek) // we store locally the CEK
          this.$router.push('/') // all is good -> redirect the user
        }
      }
    },
    sendCode () {
      if (this.fields.code.length > 0 && this.uid !== null) {
        this.success_msg = null
        this.err_msg = null
        this.loading = true
        this.$http.post('session/authcode', {uid: this.uid, password: muiHash(this.fields.password), code: this.fields.code}).then((res) => {
          this.loading = false
          if (res.body.data !== null && typeof res.body.data.cek !== 'undefined') {
            this.cek = base64.decode(decodeURIComponent(res.body.data.cek))
            // Apply user language
            if (typeof res.body.data.lang !== 'undefined') {
              if (!(res.body.data.lang in this.$i18n.messages)) {
                this.$parent.loadLanguage(res.body.data.lang, true)
                localStorage.setItem('lang', res.body.data.lang)
              }
            }

            this.$parent.token = res.body.token
            this.changeForm('passphrase')
          } else {
            this.err_msg = 'Error.default'
          }
        }, (res) => {
          this.loading = false
          this.err_msg = 'Error.default'
          if (res.body.code === 401) {
            if (res.body.message === 'badPass') {
              this.err_msg = 'Login.badPass'
            } else if (res.body.message === 'badCode') {
              this.err_msg = 'Login.invalidCode'
            } else if (res.body.message === 'validate') {
              this.$router.push({path: '/validate/' + this.uid})
            }
          }
        })
      }
    },
    toggleChangeServer () {
      this.server_form = !this.server_form
      if (this.server_url !== null && validUrl.isWebUri(this.server_url)) {
        if (window.location.protocol === 'https:' && !validUrl.isHttpsUri(this.server_url)) {
          alert(this.$t('Login.insecureHttp'))
          this.server_url = Vue.http.options.root
        } else {
          let s = this.server_url.trim()
          if (s.substr(-1, 1) === '/') s = s.substr(0, s.length - 1)
          this.server_url = s
          Vue.http.options.root = s
          localStorage.setItem('server_url', s)
        }
      }
    },
    changeForm (type) {
      let focus = 'code'
      if (type === 'login') {
        this.login_form = true
        this.passphrase_form = false
        focus = 'login'
      } else if (type === 'passphrase') {
        this.login_form = false
        this.passphrase_form = true
        focus = 'passphrase'
      } else { // code
        this.login_form = false
        this.passphrase_form = false
      }
      this.$nextTick(() => { // Once DOM updated
        this.$refs[focus].focus()
      })
    }
  },
  computed: {
    isComplete () {
      let complete = true
      let keys = this.login_form ? ['username', 'password'] : (this.passphrase_form ? ['passphrase'] : ['code'])
      for (let key of keys) {
        if (this.fields[key] === '') {
          complete = false
          break
        }
      }
      return complete
    },
    isUrl () {
      return validUrl.isWebUri(this.server_url)
    }
  },
  created () {
    this.server_url = this.$http.options.root
    if (this.$parent.isLogged()) {
      this.$router.push('/')
      return false
    }

    if (typeof this.$route.query.validation !== 'undefined') {
      this.val = true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
