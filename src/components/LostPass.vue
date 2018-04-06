<template>
  <div class="container-small">
    <vue-headful
      v-if="!this.$parent.loading"
      :title="$t('Login.forgot')"
    />
    <h1>{{ $t('Login.forgot') }}</h1>

    <form method="post" v-on:submit.prevent="changePass" v-if="change_form">
      <strong>{{ $t('Profile.changePwd') }}</strong>

      <p class="input-large">
        <input type="password" id="pwd" :placeholder="$t('Profile.newPwd')" v-model="fields.pass" required autofocus>
        <label class="fa fa-lock" for="pwd" aria-hidden="true"></label>
      </p>

      <p class="input-large">
        <input type="password" id="pwd_confirm" :placeholder="$t('Register.confirm')" v-model="fields.pass_confirm" required>
        <label class="fa fa-lock" for="pwd_confirm" aria-hidden="true"></label>
      </p>

      <br><input type="submit" class="btn btn-required" :value="$t('Global.submit')" :disabled="!isComplete">
    </form>

    <form method="post" v-on:submit.prevent="sendForm" v-if="send_form">
      <p class="input-large">
        <input type="text" id="user" :placeholder="$t('LostPass.user')" v-model="username" required>
        <label class="fa fa-user" for="user" aria-hidden="true"></label>
      </p>

      <div class="bloc-links">
        <router-link to="/login" class="mono blue">{{ $t('Login.signIn') }}</router-link>
        <input type="submit" class="btn btn-required" :value="$t('Global.submit')">
      </div>
    </form>

    <p class="red return" v-if="this.err_msg">{{ $t(this.err_msg) }}</p>
    <p class="green return" v-if="this.success_msg">{{ $t(this.success_msg) }}</p>
  </div>
</template>

<script>
import muiHash from '../mui_hash'

export default {
  name: 'LostPass',
  data () {
    return {
      change_form: false,
      send_form: true,
      err_msg: null,
      success_msg: null,
      username: '',
      uid: null,
      key: null,
      fields: {
        pass: '',
        pass_confirm: ''
      }
    }
  },
  methods: {
    changePass () {
      this.success_msg = null
      if (this.fields.pass !== this.fields.pass_confirm) {
        this.err_msg = 'Register.badPassConfirm'
      } else if (this.fields.pass.length < 6) {
        this.err_msg = 'Register.passLength'
      } else {
        this.success_msg = null
        this.err_msg = null
        this.$http.post('lostpass', {uid: this.uid, key: this.key, password: muiHash(this.fields.pass)}).then((res) => {
          this.change_form = false
          this.success_msg = 'LostPass.updateOk'
          setTimeout(function () {
            this.$router.push('/login')
          }, 1000)
        }, (res) => {
          this.err_msg = 'LostPass.keyErr'
          this.change_form = false
          this.send_form = true
        })
      }
    },
    sendForm () {
      if (this.userna.me.length > 0) {
        this.$http.post('lostpass/mail', {'username': this.username}).then((res) => {
          this.err_msg = null
          this.success_msg = null
          if (res.body.message === 'sent') {
            this.success_msg = 'Global.mailSent'
          } else if (res.body.message === 'wait') {
            this.err_msg = 'LostPass.wait'
          } else {
            this.err_msg = 'Error.default'
          }
        }, (res) => {
          if (res.body.message === 'unknownUser') {
            this.err_msg = 'LostPass.notFound'
          } else {
            this.err_msg = 'Error.default'
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

    if (typeof this.$route.params.uid !== 'undefined' && typeof this.$route.params.key !== 'undefined') {
      this.uid = this.$route.params.uid
      this.key = this.$route.params.key
      this.send_form = false
      this.change_form = true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
