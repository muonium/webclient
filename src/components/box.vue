<template>
  <div id="box" v-if="active">
    <div v-if="type === 0">
      <p @click="trigger('FolderAdd')">
        <i class="fa fa-folder-o" aria-hidden="true"></i> {{ $t('RightClick.nFolder') }}
      </p>
      <p onclick="Upload.dialog()">
        <i class="fa fa-upload" aria-hidden="true"></i> {{ $t('RightClick.upFiles') }}
      </p>
      <!-- if(Move.Files.length > 0 || Move.Folders.length > 0) { -->
      <hr>
      <p onclick="Move.paste()">
        <i class="fa fa-clipboard" aria-hidden="true"></i> {{ $t('RightClick.paste') }}
      </p>
    </div>

    <div v-if="type === 1">
      <p onclick="Selection.dl(id)">
        <i class="fa fa-download" aria-hidden="true"></i> {{ $t('RightClick.dl') }}
      </p>
      <!-- if(Files.isShared(id.substr(1))) { -->
      <p onclick="Selection.unshare(id)">
        <i class="fa fa-ban" aria-hidden="true"></i> {{ $t('RightClick.unshare') }}
      </p>
      <!-- } else { -->
      <p onclick="Selection.share(id)">
        <i class="fa fa-share" aria-hidden="true"></i> {{ $t('RightClick.share') }}
      </p>
      <hr>
      <!-- if(Trash.state == 0) { -->
      <p onclick="Favorites.update(id)">
        <i class="fa fa-star" aria-hidden="true"></i> {{ $t('RightClick.star') }}
      </p>
      <hr>
      <p onclick="Move.cut(id)">
        <i class="fa fa-scissors" aria-hidden="true"></i> {{ $t('RightClick.cut') }}
      </p>
      <p onclick="Move.copy(id)">
        <i class="fa fa-clone" aria-hidden="true"></i> {{ $t('RightClick.copy') }}
      </p>
      <p onclick="Move.trashMultiple(id)">
        <i class="fa fa-trash" aria-hidden="true"></i> {{ $t('RightClick.trash') }}
      </p>
      <!-- } else { -->
      <p onclick="Move.trashMultiple(id)">
        <i class="fa fa-undo" aria-hidden="true"></i> {{ $t('RightClick.restore') }}
      </p>
      <p onclick="Rm.multiple(id)">
        <i class="fa fa-trash" aria-hidden="true"></i> {{ $t('RightClick.rm') }}
      </p>
      <!-- } -->
      <!-- if(Move.Files.length > 0 || Move.Folders.length > 0) { -->
      <hr>
      <p onclick="Move.paste()">
        <i class="fa fa-clipboard" aria-hidden="true"></i> {{ $t('RightClick.paste') }}
      </p>
      <!-- if(Trash.state == 0) { -->
      <hr>
      <p onclick="Move.rename(id)">
        <i class="fa fa-pencil" aria-hidden="true"></i> {{ $t('RightClick.mvItem') }}
      </p>
      <!-- } -->
      <hr>
      <p onclick="Files.details(id)">
        <i class="fa fa-info" aria-hidden="true"></i> {{ $t('RightClick.vDetails') }}
      </p>
    </div>

    <div v-if="type === 2">
      <p onclick="Folders.open(id)">
        <i class="fa fa-folder-open" aria-hidden="true"></i> {{ $t('RightClick.open') }}
      </p>
      <hr>
      <!-- if(Trash.state == 0) { -->
      <p onclick="Move.cut(id)">
        <i class="fa fa-scissors" aria-hidden="true"></i> {{ $t('RightClick.cut') }}
      </p>
      <p onclick="Move.copy(id)">
        <i class="fa fa-clone" aria-hidden="true"></i> {{ $t('RightClick.copy') }}
      </p>
      <p onclick="Move.trashMultiple(id)">
        <i class="fa fa-trash" aria-hidden="true"></i> {{ $t('RightClick.trash') }}
      </p>
      <!-- } else { -->
      <p onclick="Move.trashMultiple(id)">
        <i class="fa fa-undo" aria-hidden="true"></i> {{ $t('RightClick.restore') }}
      </p>
      <p onclick="Rm.multiple(id)">
        <i class="fa fa-trash" aria-hidden="true"></i> {{ $t('RightClick.rm') }}
      </p>
      <!-- if(Move.Files.length > 0 || Move.Folders.length > 0) { -->
      <hr>
      <p onclick="Move.paste(id)">
        <i class="fa fa-clipboard" aria-hidden="true"></i> {{ $t('RightClick.paste') }}
      </p>
      <!-- if(Trash.state == 0) { -->
      <hr>
      <p onclick="Move.rename(id)">
        <i class="fa fa-pencil" aria-hidden="true"></i> {{ $t('RightClick.mvItem') }}
      </p>
      <!-- } -->
      <hr>
      <p onclick="Folders.details(id)">
        <i class="fa fa-info" aria-hidden="true"></i> {{ $t('RightClick.vDetails') }}
      </p>
    </div>
  </div>
</template>

<script>
import bus from '../bus'

export default {
  name: 'box',
  data () {
    return {
      type: 0, // 1: file, 2: folder, 0: somewhere else
      id: null,
      active: false
    }
  },
  methods: {
    open (id, type) {
      this.id = id
      this.type = parseInt(type)
      this.active = true

      if (type === 1) {
        bus.$emit('SelectionAddFile', id, null)
      } else if (type === 2) {
        bus.$emit('SelectionAddFolder', id, null)
      }
    },
    close () {
      this.active = false
    },
    trigger (event) {
      bus.$emit.apply(bus, arguments)
    }
  },
  computed: {
    trashState () {
      return this.$parent.trash
    }
  },
  created () {
    bus.$on('BoxOpen', (id, type) => this.open(id, type))
    bus.$on('BoxClose', this.close)
    window.addEventListener('click', this.close)
  },
  beforeDestroy () {
    bus.$off('BoxOpen')
    bus.$off('BoxClose')
    window.removeEventListener('click', this.close)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
<style src="../assets/css/Interface/box.css"></style>
