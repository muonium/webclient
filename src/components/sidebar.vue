<template>
  <div class="sidebar">
    <ul @click="setSelected">
      <li>
        <a href="#" @click.prevent="trigger('FolderOpenCurrent')">
          <i class="fa fa-file" aria-hidden="true"></i>
        </a>
      </li>
      <li>
        <a href="#" @click.prevent="trigger('FolderOpenTrash')">
          <i class="fa fa-trash" aria-hidden="true"></i>
        </a>
      </li>
      <li>
        <a href="#" @click.prevent="trigger('FolderOpenTransfers')">
          <i class="fa fa-exchange" aria-hidden="true"></i>
        </a>
      </li>
      <li>
        <router-link to="/bug">
          <i class="fa fa-bug" aria-hidden="true"></i>
        </router-link>
      </li>
      <li>
        <router-link to="/profile">
          <i class="fa fa-cog" aria-hidden="true"></i>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import bus from '../bus'

export default {
  name: 'sidebar',
  data () {
    return {}
  },
  methods: {
    setSelected (e) {
      let j
      for (let i of e.path) {
        if (i.tagName === 'LI') {
          j = i
        } else if (i.tagName === 'UL') {
          let s = i.querySelector('a.selected')
          if (s) s.classList.remove('selected')
          break
        }
      }
      let s = j.querySelector('a')
      if (s) s.classList.add('selected')
    },
    trigger (event) {
      bus.$emit.apply(bus, arguments)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
