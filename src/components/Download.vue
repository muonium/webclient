<template>
  <div class="container-large">
    <div class="info" v-if="!this.$parent.isLogged()">
      {{ $t('Register.donthaveaccount') }}
      <router-link to="/register">{{ $t('Register.create') }}</router-link>
    </div>

    <div class="center mtop mono">
      <h1 class="dl-filename">{{ this.infos.name }}</h1>

      <p class="dl-info">
        {{ $t('User.uploadedBy').replace('[login]', this.infos.login) }}
        {{ getDate(this.infos.last_modification) }}
      </p>
      <p class="dl-info">{{ $t('User.size') }}: {{ showSize(this.infos.size) }}</p>

      <p class="input-small">
        <input type="password" id="password" :placeholder="$t('Register.password')">
        <label class="fa fa-lock" for="password"></label>
      </p>
      <p>
        <button id="dl" class="btn mtop"
          :data-dk="this.infos.dk"
          :data-fname="this.infos.name"
          :data-fid="this.infos.folder_id"
          :data-uid="this.infos.id_owner"
        >
          {{ $t('RightClick.dl') }}
        </button>
      </p>

      <p id="msg"></p>
    </div>
    <transfers ref="transfers" show="download"/>
  </div>
</template>

<script>
import transfers from './transfers'
import moment from 'moment'

export default {
  name: 'download',
  components: {
    transfers
  },
  data () {
    return {
      id: null,
      infos: {
        name: null,
        id_owner: null,
        login: null,
        dk: null,
        folder_id: null,
        size: 0,
        last_modification: 0
      }
    }
  },
  methods: {
    getDate (timestamp) {
      let format = this.$t('Dates.date') + ' ' + this.$t('Dates.time')
      if (format === 'Dates.date Dates.time') {
        format = 'YYYY-MM-DD HH:mm'
      }
      return moment(timestamp * 1000).format(format)
    },
    showSize (size, precision = 2) { // size => size in bytes
      size = parseInt(size)
      if (isNaN(size) || size <= 0) {
        return 0
      }
      if (this.$i18n.locale === null || typeof this.$i18n.messages[this.$i18n.locale] === 'undefined' || typeof this.$i18n.messages[this.$i18n.locale].Units === 'undefined') {
        return size
      }
      let base = Math.log(size) / Math.log(1000)
      let suffixes = Object.values(this.$i18n.messages[this.$i18n.locale].Units)
      return Math.pow(1000, base - Math.floor(base)).toFixed(precision) + ' ' + suffixes[Math.floor(base)]
    }
  },
  created () {
    if (typeof this.$route.params.id === 'undefined') {
      this.$router.push('/')
      return false
    }
    this.id = this.$route.params.id
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
