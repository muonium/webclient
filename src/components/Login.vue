<template>
  <div class="container-small">
    <vue-headful
      v-if="!this.$parent.loading"
      :title="$t('Global.login')"
    />
    <div class="info green" v-if="this.val">{{ $t('Validate.done') }}</div>

    <form class="form-login" method="post" v-on:submit.prevent="sendForm" v-if="login_form">
      <h1>{{ $t('Global.login') }}</h1>

      <p class="input-large">
        <input type="text" id="field_username" :placeholder="$t('Login.username')" v-model="fields.username" required autofocus>
        <label class="fa fa-user" for="field_username" aria-hidden="true"></label>
      </p>

      <p class="input-large">
        <input type="password" id="field_password" :placeholder="$t('Register.password')" v-model="fields.password" required>
        <label class="fa fa-lock" for="field_password" aria-hidden="true"></label>
      </p>

      <p class="input-large">
        <input type="password" id="field_passphrase" :placeholder="$t('Register.passphrase')" v-model="fields.passphrase" required>
        <label class="fa fa-lock" for="field_passphrase" aria-hidden="true"></label>
      </p>

      <div class="bloc-links">
        <router-link to="lostPass" class="mono blue">{{ $t('Login.forgot') }}</router-link>
        <input type="submit" class="btn btn-required" :value="$t('Login.signIn')" :disabled="!isComplete">
      </div>

      <router-link to="/register" class="mono center">{{ $t('Login.register') }}</router-link>
    </form>

    <form method="post" v-on:submit.prevent="sendCode" v-else>
      <h1>{{ $t('Global.login') }}</h1>

      <p class="input-large">
        <input type="text" name="code" class="noicon" :placeholder="$t('Login.codeMail')" v-model="code" required>
      </p>
      <input type="submit" class="btn" :value="$t('Global.submit')">
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

export default {
  name: 'Login',
  data () {
    return {
      val: false,
      loading: false,
      err_msg: null,
      success_msg: null,
      login_form: true,
      uid: null,
      code: '',
      fields: {
        username: '',
        password: '',
        passphrase: ''
      }
    }
  },
  methods: {
    sendForm () {
      this.success_msg = null
      if (this.fields.username.length > 2 && this.fields.password.length > 5 && this.fields.passphrase.length > 0) {
        this.loading = true
        this.err_msg = null
        this.$http.post('session', {username: this.fields.username, password: muiHash(this.fields.password)}).then((res) => {
          this.loading = false
          if (res.body.data !== null && typeof res.body.data.cek !== 'undefined') {
            let cek = decodeURIComponent(res.body.data.cek)
            let fail = false
            try { // we try to decrypt the CEK with the passphrase
              cek = base64.decode(cek) // the CEK is base64encoded in the database, then we decode it
              cek = sjcl.decrypt(this.fields.passphrase, cek) // the CEK is now a JSON, we decrypt it
            } catch (e) { // the passphrase is wrong
              fail = true
              sessionStorage.clear()
              this.err_msg = 'Login.badPassphrase'
            }
            if (!fail) {
              if (res.body.message === 'doubleAuth') {
                this.login_form = false
                this.uid = res.body.data.uid
              } else if (res.body.message === 'wait') {
                this.login_form = false
                this.uid = res.body.data.uid
                this.err_msg = 'Login.wait'
              } else {
                this.success_msg = 'Login.success'
                sessionStorage.setItem('kek', this.fields.passphrase) // we store locally the passphrase
                sessionStorage.setItem('cek', cek) // we store locally the CEK
                this.$parent.token = res.body.token
                this.$router.push('/') // all is good -> redirect the user
              }
            }
          } else {
            this.err_msg = 'Error.default'
          }
        }, (res) => {
          this.loading = false
          this.err_msg = 'Error.default'
          if (res.body.code === 401) {
            if (res.body.message === 'badPass') {
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
    sendCode () {
      if (this.code.length > 0 && this.uid !== null) {
        this.success_msg = null
        this.err_msg = null
        this.loading = true
        this.$http.post('session/authcode', {uid: this.uid, password: muiHash(this.fields.password), code: this.code}).then((res) => {
          this.loading = false
          if (res.body.data !== null && typeof res.body.data.cek !== 'undefined') {
            let cek = decodeURIComponent(res.body.data.cek)
            let fail = false
            try { // we try to decrypt the CEK with the passphrase
              cek = base64.decode(cek) // the CEK is base64encoded in the database, then we decode it
              cek = sjcl.decrypt(this.fields.passphrase, cek) // the CEK is now a JSON, we decrypt it
            } catch (e) { // the passphrase is wrong
              fail = true
              sessionStorage.clear()
              this.err_msg = 'Login.badPassphrase'
            }
            if (!fail) {
              this.success_msg = 'Login.success'
              sessionStorage.setItem('kek', this.fields.passphrase) // we store locally the passphrase
              sessionStorage.setItem('cek', cek) // we store locally the CEK
              this.$parent.token = res.body.token
              this.$router.push('/') // all is good -> redirect the user
            }
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
    }
  },
  computed: {
    isComplete () {
      let complete = true
      for (let key of Object.keys(this.fields)) {
        if (this.fields[key] === '') {
          complete = false
          break
        }
      }
      return complete
    }
  },
  created () {
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
