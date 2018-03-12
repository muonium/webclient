<template>
  <div class="container-small">
    <vue-headful
      v-if="!this.$parent.loading"
      :title="$t('Global.validate')"
    />
    <h1>{{ $t('Global.validate') }}</h1>

    <div>{{ $t(this.message) }}</div>
    <a href="#" @click.prevent="refresh">{{ $t('Global.refresh') }}</a>
  </div>
</template>

<script>
export default {
  name: 'Validate',
  data () {
    return {
      message: 'Global.loading'
    }
  },
  methods: {
    refresh () {
      window.location = window.location.href.split('?')[0]
      window.location.reload()
    }
  },
  created () {
    if (this.$parent.isLogged()) {
      this.$router.push('/')
    }

    if (typeof this.$route.params.key !== 'undefined') {
      // Try to validate
      this.$http.post('validate/key', {'uid': this.$route.params.uid, 'key': this.$route.params.key}).then((res) => {
        // Account is validated
        this.$router.push({path: '/login', query: {validation: 'ok'}})
      }, (res) => {
        // Error
        this.message = 'Error.default'
        switch (res.body.message) {
          case 'differentKey':
            this.message = 'Validate.message'
            break
          case 'alreadyValidated':
            this.$router.push('/login')
        }
      })
    } else {
      // Send a validation mail
      if (typeof this.$route.query.status !== 'undefined' && this.$route.query.status === 'sent') {
        // Already sent
        this.message = 'Global.mail_sent'
      } else {
        this.$http.post('validate/mail', {'uid': this.$route.params.uid}).then((res) => {
          this.message = 'Error.default'
          switch (res.body.message) {
            case 'sent':
              this.message = 'Global.mail_sent'
              break
            case 'wait':
              this.message = 'Validate.wait'
          }
        }, (res) => {
          this.$router.push('/login') // Account already validated
        })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
