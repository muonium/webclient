<template>
  <div class="container-small">
  <vue-headful
	v-if="!this.$parent.loading"
	:title="Muonium - $t('Global.home')"
  />
  </div>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {}
  },
  created () {
    if (!this.$parent.isLogged()) {
      this.$parent.logout()
    } else {
      this.$router.push('/u/0')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
