<template>
  <div class="container-large" v-if="this.loaded">
    <div class="info" v-if="!this.$parent.isLogged()">
      {{ $t('Register.donthaveaccount') }}
      <router-link to="/register">{{ $t('Register.create') }}</router-link>
    </div>

    <div class="center mtop mono">
      <h1 class="dl-filename">{{ this.infos.name }}</h1>

      <p class="dl-info">
        {{ $t('User.uploadedBy').replace('[login]', this.infos.login) }}
        {{ utils.getDate(this.infos.last_modification) }}
      </p>
      <p class="dl-info">{{ $t('User.size') }}: {{ utils.showSize(this.infos.size) }}</p>

      <form v-if="!isDownloading" v-on:submit.prevent="dl">
        <p class="input-small">
          <input type="password" id="password" v-model="password" :placeholder="$t('Register.password')">
          <label class="fa fa-lock" for="password"></label>
        </p>
        <p>
          <input type="submit" class="btn mtop" :value="$t('RightClick.dl')">
        </p>

        <p v-if="passErr">
          {{ $t('User.badPass') }}
        </p>
      </form>
    </div>
    <transfers ref="transfers" show="download"/>
  </div>
</template>

<script>
import store from '../store'
import transfers from './transfers'
import download from '../download'
import sjcl from 'sjcl'
import utils from '../utils'

export default {
  name: 'download',
  components: {
    transfers
  },
  data () {
    return {
      shared: store.folder, // Needed in order to open transfers
      loaded: false,
      isDownloading: false,
      password: null,
      passErr: false,
      infos: {
        uid: null,
        login: null,
        name: null,
        size: 0,
        folder_id: null,
        fid: null,
        last_modification: 0,
        dk: null
      }
    }
  },
  methods: {
    dl () {
      this.passErr = false
      let fek = null
      let c = this.infos.dk.split(':')
      if (c.length !== 4) return false
      let encFek = sjcl.codec.base64.toBits(c[0])
      let salt = sjcl.codec.base64.toBits(c[1])
      let aDATA = sjcl.codec.base64.toBits(c[2])
      let initVector = sjcl.codec.base64.toBits(c[3])

      // Password derivation to get dk
      let dk = sjcl.misc.pbkdf2(this.password, salt, 7000, 256)
      let enc = new sjcl.cipher.aes(dk) // eslint-disable-line new-cap

      try {
        fek = sjcl.mode.gcm.decrypt(enc, encFek, initVector, aDATA, 128)
      } catch (e) {
        this.passErr = true
      }

      if (!this.passErr) { // Password is ok
        this.isDownloading = true
        this.shared.transfers = true
        download.dlSharedFile(this, this.infos.fid, this.infos.name, this.infos.folder_id, this.infos.uid, fek)
      }
    }
  },
  computed: {
    utils () {
      return utils
    }
  },
  created () {
    if (typeof this.$route.params.id === 'undefined') {
      this.$router.push('/')
      return false
    }

    this.$http.get('dl/?' + this.$route.params.id).then((res) => {
      this.infos = res.body.data
      this.loaded = true
    }, (res) => {
      this.$router.push('/error')
      return false
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
