<template>
  <div class="container-small">
    <vue-headful
      :title="$t('Global.login')"
    />
    <div class="info green" v-if="this.val">{{ $t('Validate.done') }}</div>

    <form class="form-login" method="post">
      <h1>{{ $t('Global.login') }}</h1>
      <p class="red" v-if="this.message">{{ this.message }}</p>

      <p class="input-large">
        <input type="text" name="username" id="field_username" :placeholder="$t('Login.username')" required autofocus>
        <label class="fa fa-user" for="field_username" aria-hidden="true"></label>
      </p>

      <p class="input-large">
        <input type="password" name="pass" id="field_password" :placeholder="$t('Register.password')" required>
        <label class="fa fa-lock" for="field_password" aria-hidden="true"></label>
      </p>

      <p class="input-large">
        <input type="password" name="passphrase" id="field_passphrase" :placeholder="$t('Register.passphrase')" required>
        <label class="fa fa-lock" for="field_passphrase" aria-hidden="true"></label>
      </p>

      <div class="bloc-links">
        <router-link to="LostPass" class="mono blue">{{ $t('Login.forgot') }}</router-link>
        <input type="button" class="btn btn-required" :value="$t('Login.signin')" disabled>
      </div>

      <router-link to="/Register" class="mono center">{{ $t('Login.register') }}</router-link>

      <div id="return">
        <p class="error"></p>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      val: false,
      message: null
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
