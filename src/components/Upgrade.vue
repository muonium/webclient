<template>
  <div class="container-large">
    <h1>{{ $t('Upgrade.upgradeMui') }}</h1>

    <div class="green" v-if="this.success_msg">{{ $t(this.success_msg) }}</div>
    <div class="red" v-if="this.err_msg">{{ $t(this.err_msg) }}</div>

    <p class="em" v-html="$t('Upgrade.mue')"></p>

    <div class="bloc-offers">
      <div v-for="(offer, index) in this.offers" :key="index">
        <div class="most-popular" v-if="index === 0">Most Popular</div>
        <div class="offer-size">{{ showSize(offer.size) }}</div>
        <div class="offer-price">
          <span class="currency">{{ offer.currency_symbol }}</span>
          {{ offer.price }}
        </div>
        <div class="offer-duration">
          {{ duration(offer.duration) }}
        </div>
        <form :action="endpoint" method="post" target="_blank" v-if="offer.product_id">
          <input type="hidden" :name="index" :value="field" v-for="(field, index) in offer.fields" :key="index">
          <button type="submit" class="btn">{{ $t('Upgrade.upgrade') }}</button>
        </form>
      </div>
    </div>

    <h2 class="em">{{ $t('Upgrade.history') }}</h2>
    <table class="table-large table-responsive">
      <tr>
        <th>{{ $t('User.size') }}</th>
        <th>{{ $t('Upgrade.price') }}</th>
        <th>{{ $t('Upgrade.start_date') }}</th>
        <th>{{ $t('Upgrade.end_date') }}</th>
        <th></th>
      </tr>
      <tr v-for="(row, index) in this.history" :key="index">
        <td>{{ showSize(row.size) }}</td>
        <td>{{ row.price }} {{ row.currency_symbol }}</td>
        <td>{{ getDate(row.start) }}</td>
        <td>{{ getDate(row.end) }}</td>
        <td class="fit-width">
          <span class="red" v-if="row.removed === 1">{{ $t('Upgrade.expired') }}</span>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'upgrade',
  data () {
    return {
      endpoint: null,
      offers: [],
      history: [],
      success_msg: null,
      err_msg: null
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
      return parseFloat(Math.pow(1000, base - Math.floor(base)).toFixed(precision)) + ' ' + suffixes[Math.floor(base)]
    },
    duration (months) {
      if (months < 0) return this.$t('Upgrade.lifetime')
      if (months === 12) return '1 ' + this.$t('Upgrade.year')
      if (months % 12 === 0) return (months / 12) + ' ' + this.$t('Upgrade.years')
      if (months === 1) return '1 ' + this.$t('Upgrade.month')
      return months + ' ' + this.$t('Upgrade.months')
    }
  },
  created () {
    if (!this.$parent.isLogged()) {
      this.$parent.logout()
      return false
    }

    if (typeof this.$route.query.success !== 'undefined') {
      this.success_msg = 'Upgrade.success_msg'
    }

    this.$http.get('upgrade/plans').then((res) => {
      this.endpoint = res.body.data.endpoint
      this.offers = res.body.data.plans
    }, (res) => {
      console.log(res)
    })

    this.$http.get('upgrade/history').then((res) => {
      this.history = res.body.data
    }, (res) => {
      console.log(res)
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
