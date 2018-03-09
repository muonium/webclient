<template>
  <div class="container-small">
    <vue-headful
      :title="$t('Global.validate')"
    />
    <h1>{{ $t('Global.validate') }}</h1>

    {{ $t(this.message) }}<br>
    <a href="#" @click.prevent="refresh">{{ $t('Global.refresh') }}</a>
  </div>
</template>

<script>
export default {
  name: 'Validate',
  data () {
    return {
      status: null,
      message: 'Validate.message'
    }
  },
  methods: {
    refresh () {
      this.$router.go('#' + this.$router.currentRoute.fullPath)
    }
  },
  created () {
    if (this.$parent.token) {
      this.$router.push('/')
    }

    if (typeof this.$route.query.status !== 'undefined') {
      this.status = this.$route.query.status
    }
    switch (this.status) {
      case 'send':
        break
      case 'sent':
        this.message = 'Global.mail_sent'
        break
      case 'wait':
        this.message = 'Validate.wait'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
