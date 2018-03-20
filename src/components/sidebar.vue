<template>
  <div class="sidebar">
    <ul @click="setSelected">
      <li>
        <a href="#" id="sidebar-folder" @click.prevent="trigger('FolderOpenCurrent')" :class="this.selected === 'folder' ? 'selected' : ''">
          <i class="fa fa-file" aria-hidden="true"></i>
        </a>
      </li>
      <li>
        <a href="#" id="sidebar-trash" @click.prevent="trigger('FolderOpenTrash')" :title="$t('RightClick.trash')" :class="this.selected === 'trash' ? 'selected' : ''">
          <i class="fa fa-trash" aria-hidden="true"></i>
        </a>
      </li>
      <li>
        <a href="#" id="sidebar-transfers" @click.prevent="trigger('FolderOpenTransfers')" :title="$t('Global.transfers')" :class="this.selected === 'transfers' ? 'selected' : ''">
          <i class="fa fa-exchange" aria-hidden="true"></i>
        </a>
      </li>
      <li>
        <router-link to="/bug" id="sidebar-bug" :title="$t('Global.bug')" :class="this.selected === 'bug' ? 'selected' : ''">
          <i class="fa fa-bug" aria-hidden="true"></i>
        </router-link>
      </li>
      <li>
        <router-link to="/profile" id="sidebar-profile" :title="$t('UserMenu.settings')" :class="this.selected === 'profile' ? 'selected' : ''">
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
      for (let i of e.path) {
        if (i.tagName === 'LI') {
          this.selected = i.querySelector('a').id.replace('sidebar-', '')
          break
        }
      }
    },
    getCurrentFolder () {
      return store.folder.folder_id
    },
    trigger (event) {
      bus.$emit.apply(bus, arguments)
    }
  },
  created () {
    if (this.$route.path === '/bug') {
      this.selected = 'bug'
    } else if (this.$route.path === '/profile') {
      this.selected = 'profile'
    } else if (store.folder.trash) {
      this.selected = 'trash'
    } else {
      this.selected = 'folder'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
