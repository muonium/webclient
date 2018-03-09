<template>
  <div class="container-small">
    <vue-headful
      :title="$t('Global.register')"
    />
    <form class="form-register" method="post" v-on:submit.prevent="sendForm">
      <h1>{{ $t('Global.register') }}</h1>

      <p class="input-large">
        <input type="text" id="field_mail" :placeholder="$t('Register.email')" v-model="fields.mail.value" required autofocus>
        <label class="fa fa-envelope" for="field_mail" aria-hidden="true"></label>
      </p>

      <p class="input-large">
        <input type="text" id="field_login" :placeholder="$t('Register.login')" v-model="fields.login.value" required>
        <label class="fa fa-user" for="field_login" aria-hidden="true"></label>
      </p>

      <p class="input-large">
        <input type="password" id="field_pass" :placeholder="$t('Register.password')" v-model="fields.pass.value" required>
        <label class="fa fa-lock" for="field_pass" aria-hidden="true"></label>
      </p>

      <p class="input-large">
        <input type="password" id="field_pass_confirm" :placeholder="$t('Register.confirm')" v-model="fields.pass_confirm.value" required>
        <label class="fa fa-lock" for="field_pass_confirm" aria-hidden="true"></label>
      </p>

      <p class="input-large">
        <input type="password" id="field_passphrase" :placeholder="$t('Register.passphrase')" v-model="fields.passphrase.value" required>
        <label class="fa fa-lock" for="field_passphrase" aria-hidden="true"></label>
      </p>

      <p class="input-large">
        <input type="password" id="field_passphrase_confirm" :placeholder="$t('Register.confirm')" v-model="fields.passphrase_confirm.value" required>
        <label class="fa fa-lock" for="field_passphrase_confirm" aria-hidden="true"></label>
      </p>

      <fieldset class="nomargin">
        <legend>{{ $t('Profile.doubleAuth') }}</legend>
        <p class="input-large">
          <input type="checkbox" id="double_auth" v-model="fields.double_auth.value">
          <label for="double_auth">{{ $t('Register.doubleAuth') }}</label>
        </p>
      </fieldset>

      <div class="bloc-links">
        <router-link to="/Login" class="mono blue">{{ $t('Register.alreadyregistered') }}</router-link>
        <input type="submit" class="btn btn-required" :value="$t('Global.register')" :disabled="!isComplete">
      </div>

      <p class="red" v-if="this.err_msg">{{ $t(this.err_msg) }}</p>
      <p class="green" v-if="this.success_msg">{{ $t(this.success_msg) }}</p>
      <img src="../assets/img/index/loader.svg" class="loader" v-if="loading">
    </form>
  </div>
</template>

<script>
import sjcl from 'sjcl'
import base64 from 'hi-base64'
import muiHash from '../mui_hash'

let randomString = function (length, chars) {
  // Thanks to Nimphious
  // Code found on stackoverflow (sometimes it's good to be lazy)
  let mask = ''
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmn!@#$%^&*()_+-={}[]";\'<>?,opqrstuvwxyz'
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (chars.indexOf('#') > -1) mask += '0123456789'
  if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]";\'<>?,'
  let result = ''
  for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)]
  return result
}

export default {
  name: 'Register',
  data () {
    return {
      loading: false,
      err_msg: null,
      success_msg: null,
      fields: {
        mail: {value: '', required: true},
        login: {value: '', required: true},
        pass: {value: '', required: true},
        pass_confirm: {value: '', required: true},
        passphrase: {value: '', required: true},
        passphrase_confirm: {value: '', required: true},
        double_auth: {value: false, required: false}
      }
    }
  },
  methods: {
    sendForm () {
      this.success_msg = null
      if (this.fields.pass.value !== this.fields.pass_confirm.value) {
        this.err_msg = 'Register.badPassConfirm'
      } else if (this.fields.passphrase.value !== this.fields.passphrase_confirm.value) {
        this.err_msg = 'Register.badPassphraseConfirm'
      } else if (this.fields.pass.value === this.fields.passphrase.value) {
        this.err_msg = 'Register.passEqualPassphrase'
      } else if (this.fields.login.value.length < 2 || this.fields.mail.value.length < 6) {
        this.err_msg = 'Register.form'
      } else if (this.fields.pass.value.length < 6 || this.fields.passphrase.value.length < 6) {
        this.err_msg = 'Register.passLength'
      } else {
        this.loading = true
        this.err_msg = null
        this.$http.post('user', {
          login: this.fields.login.value,
          password: muiHash(this.fields.pass.value),
          mail: this.fields.mail.value,
          cek: this.generateCEK(),
          doubleAuth: this.fields.double_auth.value
        }).then((res) => {
          this.loading = false
          this.success_msg = 'Register.ok'
          // TODO: redirect to validate instead login
          this.$router.push('/Login') // all is good -> redirect the user
        }, (res) => {
          this.loading = false
          this.err_msg = 'Error.default'
          switch (res.body.message) {
            case 'loginExists':
              this.err_msg = 'Register.loginExists'
              break
            case 'mailExists':
              this.err_msg = 'Register.mailExists'
              break
            case 'loginFormat':
              this.err_msg = 'Register.loginFormat'
              break
            case 'mailFormat':
              this.err_msg = 'Register.mailFormat'
          }
        })
      }
    },
    generateCEK () {
      let key = randomString(32, '#A!')
      // crypto parameters
      let a = sjcl.random.randomWords(4) // authentication data - 128 bits
      let i = sjcl.random.randomWords(4) // initialization vector - 128 bits
      let s = sjcl.random.randomWords(4) // salt - 128 bits
      // encrypt it
      let cek = sjcl.encrypt(this.fields.passphrase.value, key, {
        mode: 'gcm', iv: i, salt: s, iter: 7000, ks: 256, adata: a, ts: 128
      })
      return base64.encode(cek) // don't store a Json in DB...
    }
  },
  computed: {
    isComplete () {
      let complete = true
      for (let key of Object.keys(this.fields)) {
        if (this.fields[key].required && (this.fields[key].value === '' || this.fields[key].value === false)) {
          complete = false
          break
        }
      }
      return complete
    }
  },
  created () {
    if (this.$parent.token) {
      this.$router.push('/')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
