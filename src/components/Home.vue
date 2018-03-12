<template>
  <div class="container-small">
    <vue-headful
      title="Muonium"
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
