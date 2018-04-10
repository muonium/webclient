<template>
  <body v-show="!this.loading">
    <header>
      <div id="logo">
        <router-link to="/">
          <img :src="this.base + 'static/img/logos/muonium_H_01.png'" :title="$t('Global.home')" :alt="$t('Global.home')">
        </router-link>
      </div>
      <language-selector/>
      <a href="#" class="logout" :title="$t('Global.logout')" v-if="this.token" @click.prevent="logout">
        <i class="fa fa-sign-out" aria-hidden="true"></i>
      </a>
    </header>
    <div id="main">
      <sidebar v-if="this.sidebar"/>
      <router-view/>
      <selection v-if="this.selection"/>
      <a href="#" id="dl_decrypted"></a>
    </div>
  </body>
</template>

<script>
import Vue from 'vue'
import language from './language'
import languageSelector from './components/language_selector'
import sidebar from './components/sidebar'
import selection from './components/selection'
import utils from './utils'

export default {
  name: 'App',
  components: {
    languageSelector,
    sidebar,
    selection
  },
  data () {
    return {
      base: ROOT, // eslint-disable-line no-undef
      theme: localStorage.getItem('theme') === 'dark' ? 'dark' : 'light',
      loading: true,
      token: sessionStorage.getItem('token'),
      sidebar: false,
      selection: false
    }
  },
  methods: {
    loadLanguage (lang, next = false) {
      this.$http.get(`public/translations/${lang}.json?v=${utils.hash}`).then((res) => {
        this.$i18n.setLocaleMessage(lang, res.body)
        if (next) {
          this.loading = false
          this.$i18n.locale = lang
          Vue.config.lang = lang
          utils.t = this.$i18n.messages[this.$i18n.locale]
        }
      })
    },
    isInInput (e) {
      // Check if the event targets an input/textarea
      let exclude = ['radio', 'checkbox', 'button', 'submit']
      if (e.target.tagName === 'TEXTAREA' || (e.target.tagName === 'INPUT' && exclude.indexOf(e.target.type) === -1)) {
        return true
      }
      return false
    },
    isLogged () {
      if (this.token !== null && sessionStorage.getItem('cek') !== null && sessionStorage.getItem('kek') !== null) {
        return true
      }
      sessionStorage.clear()
      return false
    },
    logout () {
      let jti = utils.getJti(this.token)
      if (jti !== false && jti !== null) {
        this.$http.delete('session/jti/' + jti)
      }
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

    // Theme
    let theme = document.querySelector('#theme') || document.createElement('link')
    theme.id = 'theme'
    theme.rel = 'stylesheet'
    theme.type = 'text/css'
    theme.href = this.base + (localStorage.getItem('theme') === 'dark' ? 'static/css/2018/dark.css' : 'static/css/2018/light.css')
    document.querySelector('head').appendChild(theme)

    window.oncontextmenu = (e) => { // Disable right click except in input, textarea
      return this.isInInput(e)
    }
  }
}
</script>

<style src="./assets/css/2018/style.css"></style>
<style src="./assets/css/Interface/tooltip.css"></style>
