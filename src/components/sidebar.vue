<template>
  <div class="sidebar">
    <ul @click="setSelected">
      <li>
        <a href="#" id="sidebar-folder" @click.prevent="setState('folder')" :class="this.selected === 'folder' ? 'selected' : ''">
          <i class="fa fa-file" aria-hidden="true"></i>
        </a>
      </li>
      <li>
        <a href="#" id="sidebar-trash" @click.prevent="setState('trash')" :title="$t('Selection.trash')" :class="this.selected === 'trash' ? 'selected' : ''">
          <i class="fa fa-trash" aria-hidden="true"></i>
        </a>
      </li>
      <li>
        <a href="#" id="sidebar-transfers" @click.prevent="setState('transfers')" :title="$t('Global.transfers')" :class="this.selected === 'transfers' ? 'selected' : ''">
          <i class="fa fa-exchange" aria-hidden="true"></i>
        </a>
      </li>
      <li>
        <router-link to="/bug" id="sidebar-bug" :title="$t('Global.bug')" :class="this.selected === 'bug' ? 'selected' : ''">
          <i class="fa fa-bug" aria-hidden="true"></i>
        </router-link>
      </li>
      <li>
        <router-link to="/profile" id="sidebar-profile" :title="$t('Sidebar.settings')" :class="this.selected === 'profile' ? 'selected' : ''">
          <i class="fa fa-cog" aria-hidden="true"></i>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import store from '../store'
import bus from '../bus'

export default {
  name: 'sidebar',
  data () {
    return {
      selected: null
    }
  },
  methods: {
    setSelected (e) {
      this.selected = null
      let el = e.target
      while (el) {
        if (el.tagName === 'LI') {
          this.selected = el.querySelector('a').id.replace('sidebar-', '')
          break
        }
        el = el.parentElement
      }
    },
    setState (state) {
      let trashState = false
      switch (state) {
        case 'trash':
          store.folder.folder_id = 0
          store.folder.trash = true
          trashState = true
          break
        case 'transfers':
          store.folder.transfers = true
          break
        case 'transfersExit':
          store.folder.transfers = false
          break
        case 'folder':
          store.folder.folder_id = 0
          store.folder.trash = false
          store.folder.transfers = false
          trashState = true
          break
        default:
          store.folder.trash = false
          store.folder.transfers = false
      }
      if (trashState) bus.$emit('FolderOpen', store.folder.folder_id, trashState)
      this.$router.push('/u/' + store.folder.folder_id)
    }
  },
  created () {
    bus.$on('SidebarReset', () => {
      this.selected = null
    })
    bus.$on('SidebarOpenTransfers', () => {
      this.selected = 'transfers'
    })
    bus.$on('SidebarCloseTransfers', () => {
      this.selected = store.folder.trash ? 'trash' : 'folder'
    })

    if (this.$route.path === '/bug') {
      this.selected = 'bug'
    } else if (this.$route.path === '/profile') {
      this.selected = 'profile'
    } else if (store.folder.trash) {
      this.selected = 'trash'
    } else if (this.$route.path === '/upgrade') {
      this.selected = null
    } else {
      this.selected = 'folder'
    }
  },
  beforeDestroy () {
    bus.$off('SidebarReset')
    bus.$off('SidebarOpenTransfers')
    bus.$off('SidebarCloseTransfers')
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
