<template>
  <div class="container-small">
    <vue-headful
      title="Muonium"
    />
    <router-link to="/Login">Login</router-link>
    <router-link to="/Register">Register</router-link><br>
    token: {{ this.$parent.token }}
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
