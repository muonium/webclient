import Vue from 'vue'
import VueResource from 'vue-resource'
import App from './App'
import router from './router'
import VueI18n from 'vue-i18n'
import vueHeadful from 'vue-headful'

Vue.config.productionTip = false

Vue.use(VueResource)
Vue.use(VueI18n)
Vue.component('vue-headful', vueHeadful)
Vue.http.options.root = 'http://192.168.1.16/server'

// Token management middleware
Vue.http.interceptors.push(function (request, next) {
  // Request processing
  let token = sessionStorage.getItem('token')
  if (token !== null && request.url.indexOf('.json') === -1) {
    // If a token is stored and requested file is not a json, then, send the token
    request.headers.set('Authorization', 'Bearer ' + token)
  }

  return function (resp) {
    // Response processing
    if (request.url.indexOf('.json') === -1) {
      if (typeof resp.body.token !== 'undefined' && resp.body.token !== null && resp.body.token !== token) {
        sessionStorage.setItem('token', resp.body.token)
      }

      if (resp.body.code === 401 || (typeof resp.body.message !== 'undefined' && resp.body.message === 'removeToken')) {
        sessionStorage.clear()
      }
    }
  }
})

const i18n = new VueI18n({
  locale: null,
  fallbackLocale: 'en',
  messages: {},
  silentTranslationWarn: true
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  router,
  render: h => h(App)
})
