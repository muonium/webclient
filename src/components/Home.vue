<template>
  <div class="container-small">
    <vue-headful
      title="Muonium"
    />
    token: {{ this.$parent.token }}
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
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
