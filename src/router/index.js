import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home'
import Login from '@/components/Login'
import Register from '@/components/Register'
import LostPass from '@/components/LostPass'
import Validate from '@/components/Validate'
import Folder from '@/components/Folder'
import Bug from '@/components/Bug'
import Profile from '@/components/Profile'
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
      path: '/lostPass/:uid/:key',
      name: 'LostPassKey',
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
      path: '/u',
      name: 'Folder',
      component: Folder
    },
    {
      path: '/u/:folder_id',
      name: 'FolderId',
      component: Folder
    },
    {
      path: '/bug',
      name: 'Bug',
      component: Bug
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile
    },
    {
      path: '*',
      name: 'PageNotFound',
      component: PageNotFound
    }
  ]
})
