<template>
  <body v-show="!this.loading">
    <header>
      <div id="logo">
        <router-link to="/">
          <img src="/static/img/logos/muonium_H_01.png" :title="$t('Global.home')" :alt="$t('Global.home')">
        </router-link>
      </div>
      <language-selector/>
      <a href="#" class="logout" :title="$t('Global.logout')" v-if="this.token" @click.prevent="logout">
        <i class="fa fa-sign-out" aria-hidden="true"></i>
      </a>
    </header>
    <div id="main">
      <router-view/>
    </div>
  </body>
</template>

<script>
import Vue from 'vue'
import language from './language'
import languageSelector from './components/language_selector'

export default {
  name: 'App',
  components: {
    languageSelector
  },
  data () {
    return {
      loading: true,
      token: sessionStorage.getItem('token')
    }
  },
  methods: {
    loadLanguage (lang, next = false) {
      this.$http.get(`public/translations/${lang}.json`).then((res) => {
        this.$i18n.setLocaleMessage(lang, res.body)
        if (next) {
          this.loading = false
          this.$i18n.locale = lang
          Vue.config.lang = lang
        }
      })
    },
    isLogged () {
      if (this.token !== null && sessionStorage.getItem('cek') !== null && sessionStorage.getItem('kek') !== null) {
        return true
      }
      sessionStorage.clear()
      return false
    },
    logout () {
      this.token = null
      sessionStorage.clear()
      this.$router.push('/login')
    }
  },
  created () {
    if (language.current !== 'en') {
      this.loadLanguage('en')
    }
    this.loadLanguage(language.current, true)
  }
}
</script>

<style src="./assets/css/2018/style.css"></style>
<style src="./assets/css/2018/dark.css"></style>
