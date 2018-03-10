import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home'
import Login from '@/components/Login'
import Register from '@/components/Register'
import LostPass from '@/components/LostPass'
import Validate from '@/components/Validate'
import PageNotFound from '@/components/PageNotFound'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/lostPass',
      name: 'LostPass',
      component: LostPass
    },
    {
      path: '/validate/:uid',
      name: 'Validate',
      component: Validate
    },
    {
      path: '/validate/:uid/:key',
      name: 'ValidateKey',
      component: Validate
    },
    {
      path: '*',
      name: 'PageNotFound',
      component: PageNotFound
    }
  ]
})
