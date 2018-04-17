<template>
  <div class="container-large">
    <form method="post" class="form-bug" v-on:submit.prevent="sendForm">
      <h1>{{ $t('Global.bug') }}</h1>

      <p class="input-large">
        <input type="text" v-model="fields.os.value" :placeholder="$t('Bug.os')">
      </p>

      <p class="input-large">
        <input type="text" v-model="fields.browser.value" :placeholder="$t('Bug.browser')">
      </p>

      <p class="input-large">
        <input type="text" v-model="fields.version.value" :placeholder="$t('Bug.browserVersion')">
      </p>

      <fieldset>
        <legend>{{ $t('Bug.message') }}*</legend>
        <p class="input-large">
          <textarea v-model="fields.message.value" cols="50" rows="5" required autofocus></textarea>
        </p>
      </fieldset>

      <input type="submit" :value="$t('Bug.send')" class="btn btn-required" :disabled="!isComplete">
    </form>

    <p class="red return" v-if="this.err_msg">{{ $t(this.err_msg) }}</p>
    <p class="green return" v-if="this.success_msg">{{ $t(this.success_msg) }}</p>
    <img src="../assets/img/index/loader.svg" class="loader" v-if="loading">
  </div>
</template>

<script>
import ua from 'ua-parser-js'

export default {
  name: 'bug',
  data () {
    return {
      err_msg: null,
      success_msg: null,
      loading: false,
      fields: {
        os: {value: '', required: true},
        browser: {value: '', required: true},
        version: {value: '', required: false},
        message: {value: '', required: true}
      },
      os: {},
      browsers: {}
    }
  },
  methods: {
    sendForm () {
      this.success_msg = null
      this.err_msg = null
      this.loading = true
      this.$http.post('bug', {os: this.fields.os.value, browser: this.fields.browser.value, version: this.fields.version.value, message: this.fields.message.value}).then((res) => {
        this.loading = false
        if (res.body.message === 'sent') {
          this.success_msg = 'Bug.sent'
        } else {
          this.err_msg = 'Bug.wait'
        }
      }, (res) => {
        this.loading = false
        if (res.body.message === 'messageLength') {
          this.err_msg = 'Bug.messageLength'
        } else {
          this.err_msg = 'Bug.form'
        }
      })
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
    if (!this.$parent.isLogged()) {
      this.$parent.logout()
      return false
    }

    let infos = ua.UAParser()
    this.fields.os.value = infos.os.name + ' ' + infos.os.version
    this.fields.browser.value = infos.browser.name
    this.fields.version.value = infos.browser.version
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
<style scoped></style>
