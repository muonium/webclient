<template>
  <div id="app" v-if="!this.loading">
    <languageSwitcher/>
    <img src="/static/img/logos/muonium_H_01.png">
    <router-view/>
  </div>
</template>

<script>
import Vue from 'vue'
import language from './language'
import languageSwitcher from './components/language_switcher'

export default {
  name: 'App',
  components: {
    languageSwitcher
  },
  data () {
    return {
      loading: true
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

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
