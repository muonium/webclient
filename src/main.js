import Vue from 'vue'
import VueResource from 'vue-resource'
import App from './App'
import router from './router'
import VueI18n from 'vue-i18n'

Vue.config.productionTip = false

Vue.use(VueResource)

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: null,
  fallbackLocale: 'en',
  messages: {}
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  router,
  render: h => h(App)
})
