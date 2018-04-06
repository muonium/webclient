<template>
  <div class="container-large">
    <h1>{{ $t('Upgrade.upgradeMui') }}</h1>

    <div class="green" v-if="this.success_msg">{{ $t(this.success_msg) }}</div>
    <div class="red" v-if="this.err_msg">{{ $t(this.err_msg) }}</div>

    <p class="em" v-html="$t('Upgrade.mue')"></p>

    <div class="bloc-offers">
      <div v-for="(offer, index) in this.offers" :key="'offer-' + index">
        <div class="most-popular" v-if="index === 0">{{ $t('Upgrade.mostPopular') }}</div>
        <div class="offer-size">{{ utils.showSize(offer.size) }}</div>
        <div class="offer-price">
          <span class="currency">{{ offer.currency_symbol }}</span>{{ offer.price.toFixed(2) }}
        </div>
        <div class="offer-duration">
          {{ duration(offer.duration) }}
        </div>
        <form :action="endpoint" method="post" target="_blank" v-if="offer.product_id">
          <input type="hidden" :name="index" :value="field" v-for="(field, index) in offer.fields" :key="'field-' + index">
          <button type="submit" class="btn">{{ $t('Global.upgrade') }}</button>
        </form>
      </div>
    </div>

    <h2 class="em">{{ $t('Upgrade.history') }}</h2>
    <table class="table-large table-responsive">
      <tr>
        <th>{{ $t('Tree.size') }}</th>
        <th>{{ $t('Upgrade.price') }}</th>
        <th>{{ $t('Upgrade.startDate') }}</th>
        <th>{{ $t('Upgrade.endDate') }}</th>
        <th></th>
      </tr>
      <tr v-for="(row, index) in this.history" :key="'history-' + index">
        <td>{{ utils.showSize(row.size) }}</td>
        <td>{{ row.price }} {{ row.currency_symbol }}</td>
        <td>{{ utils.getDate(row.start) }}</td>
        <td>{{ utils.getDate(row.end) }}</td>
        <td class="fit-width">
          <span class="red" v-if="row.removed === 1">{{ $t('Upgrade.expired') }}</span>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import utils from '../utils'

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
      this.success_msg = 'Upgrade.successMsg'
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
  },
  computed: {
    utils () {
      return utils
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
