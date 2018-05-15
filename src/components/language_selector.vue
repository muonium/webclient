<template>
  <div id="language-selector">
    <select v-on:change="setLocale" v-model="selectedLanguage">
      <option v-for="(value, locale) in this.languages" :value="locale" :key="'locale-' + locale">
        {{ value }}
      </option>
    </select>
  </div>
</template>

<script>
import Vue from 'vue'
import language from '../language'
import utils from '../utils'

var activeLocale = language.current

export default {
  data () {
    return {
      languages: language.languages,
      selectedLanguage: activeLocale
    }
  },
  methods: {
    setLocale () {
      let locale = this.selectedLanguage
      if (locale in this.$i18n.messages) {
        this.successCallback(locale)
      } else {
        this.$http.get(`public/translations/${locale}.json?v=${utils.hash}`).then((res) => {
          this.$i18n.setLocaleMessage(locale, res.body)
          this.successCallback(locale)
        })
      }
    },
    successCallback (locale) {
      Vue.config.lang = locale
      activeLocale = locale
      this.$i18n.locale = locale
      utils.t = this.$i18n.messages[this.$i18n.locale]
      language.current = locale
      localStorage.setItem('lang', locale)
      if (this.$root.$children[0].isLogged()) {
        this.$http.post('user/changeLang')
      }
    }
  }
}
</script>
