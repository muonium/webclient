<template>
  <div class="container-small">
    <vue-headful
      :title="$t('Global.register')"
    />
    <form class="form-register" method="post">
      <h1>{{ $t('Global.register') }}</h1>

      <p class="input-large">
        <input type="text" id="field_mail" :placeholder="$t('Register.email')" required autofocus>
        <label class="fa fa-envelope" for="field_mail" aria-hidden="true"></label>
      </p>

      <p class="input-large">
        <input type="text" id="field_login" :placeholder="$t('Register.login')" required>
        <label class="fa fa-user" for="field_login" aria-hidden="true"></label>
      </p>

      <p class="input-large">
        <input type="password" id="field_pass" :placeholder="$t('Register.password')" required>
        <label class="fa fa-lock" for="field_pass" aria-hidden="true"></label>
      </p>

      <p class="input-large">
        <input type="password" id="field_pass_confirm" :placeholder="$t('Register.confirm')" required>
        <label class="fa fa-lock" for="field_pass_confirm" aria-hidden="true"></label>
      </p>

      <p class="input-large">
        <input type="password" id="field_passphrase" :placeholder="$t('Register.passphrase')" required>
        <label class="fa fa-lock" for="field_passphrase" aria-hidden="true"></label>
      </p>

      <p class="input-large">
        <input type="password" id="field_passphrase_confirm" :placeholder="$t('Register.confirm')" required>
        <label class="fa fa-lock" for="field_passphrase_confirm" aria-hidden="true"></label>
      </p>

      <fieldset class="nomargin">
        <legend>{{ $t('Profile.doubleAuth') }}</legend>
        <p class="input-large">
          <input type="checkbox" id="doubleAuth" name="doubleAuth">
          <label for="doubleAuth">{{ $t('Register.doubleAuth') }}</label>
        </p>
      </fieldset>

      <div class="bloc-links">
        <router-link to="/Login" class="mono blue">{{ $t('Register.alreadyregistered') }}</router-link>
        <input type="button" class="btn btn-required" :value="$t('Global.register')" disabled>
      </div>

      <div id="return">
        <p class="error"></p>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data () {
    return {}
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
