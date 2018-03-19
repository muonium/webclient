<template>
  <div class="container-large">
    <div class="info mono">
      {{ $t('Profile.upgrade') }}
      <router-link to="/upgrade">{{ $t('Profile.getmore') }}</router-link>
    </div><br>

    <h1>{{ $t('UserMenu.settings') }}</h1>
    <fieldset>
      <legend>{{ $t('Global.profile') }}</legend>
      <p>
        <span class="label">{{ $t('Register.login') }}:</span>
        <span id="username">{{ this.login }}</span>
      </p>
      <p>
        <span class="label">{{ $t('Register.email') }}:</span>
        <span id="email">{{ this.email }}</span>
      </p>
      <p>
        <span class="label">ID:</span>
        {{ this.id }}
      </p>
    </fieldset>

    <fieldset>
      <legend>{{ $t('Profile.mailusername') }}</legend>
      <div class="bloc-input">
        <div>
          <form>
            <h3>{{ $t('Profile.changelogin') }}</h3>
            <p class="input-large">
              <input type="text" id="new_login" :placeholder="$t('Profile.newlogin')" required>
              <label class="fa fa-user" for="new_login" aria-hidden="true"></label>
            </p>
            <input type="submit" class="btn btn-required btn-profile" @click="changeLogin" :value="$t('Global.submit')" disabled>
            <div id="changeLoginReturn"></div>
          </form>
        </div>
        <div>
          <form>
            <h3>{{ $t('Profile.changemail') }}</h3>
            <p class="input-large">
              <input type="text" id="new_mail" :placeholder="$t('Profile.changemail')" required>
              <label class="fa fa-envelope" for="new_mail" aria-hidden="true"></label>
            </p>
            <input type="submit" class="btn btn-required btn-profile" @click="changeMail" :value="$t('Global.submit')" disabled>
            <div id="changeMailReturn"></div>
          </form>
        </div>
      </div>
    </fieldset>

    <fieldset>
      <legend>{{ $t('Profile.pwdpp') }}</legend>
      <div class="bloc-input">
        <div>
          <form>
            <h3>{{ $t('Profile.changepwd') }}</h3>
            <p class="input-large">
              <input type="password" id="old_pwd" :placeholder="$t('Profile.oldpwd')" required>
              <label class="fa fa-lock" for="old_pwd" aria-hidden="true"></label>
            </p>
            <p class="input-large">
              <input type="password" id="new_pwd" :placeholder="$t('Profile.newpwd')" required>
              <label class="fa fa-lock" for="new_pwd" aria-hidden="true"></label>
            </p>
            <p class="input-large">
              <input type="password" id="pwd_confirm" :placeholder="$t('Register.confirm')" required>
              <label class="fa fa-lock" for="pwd_confirm" aria-hidden="true"></label>
            </p>
            <input type="submit" class="btn btn-required btn-profile" @click="changePassword" :value="$t('Global.submit')" disabled>
            <div id="changePasswordReturn"></div>
          </form>
        </div>
        <div>
          <form>
            <h3>{{ $t('Profile.changepp') }}</h3>
            <p class="input-large">
              <input type="password" id="old_pp" :placeholder="$t('Profile.oldpp')" required>
              <label class="fa fa-lock" for="old_pp" aria-hidden="true"></label>
            </p>
            <p class="input-large">
              <input type="password" id="new_pp" :placeholder="$t('Profile.newpp')" required>
              <label class="fa fa-lock" for="new_pp" aria-hidden="true"></label>
            </p>
            <p class="input-large">
              <input type="password" id="pp_confirm" :placeholder="$t('Register.confirm')" required>
              <label class="fa fa-lock" for="pp_confirm" aria-hidden="true"></label>
            </p>
            <input type="submit" class="btn btn-required btn-profile" @click="changeCek" :value="$t('Global.submit')" disabled>
            <div id="changePassPhraseReturn"></div>
          </form>
        </div>
      </div>
    </fieldset>

    <fieldset>
      <legend>{{ $t('Profile.otheroptions') }}</legend>
      <h3>{{ $t('Profile.theme') }}</h3>
      <p class="input-large">
        <input type="radio" name="theme" id="light" @click="switchTheme">
        <label for="light">Light</label>

        <input type="radio" name="theme" id="dark" @click="switchTheme">
        <label for="dark">Dark</label>
      </p>
    </fieldset>

    <fieldset>
      <h3>{{ $t('Profile.doubleAuth') }}</h3>
      <p class="input-large">
        <input type="checkbox" @click="changeAuth" id="doubleAuth" :checked="doubleAuth">
        <label for="doubleAuth">{{ $t('Register.doubleAuth') }}</label>
      </p>
      <div id="changeAuthReturn"></div>
    </fieldset>

    <fieldset>
      <form>
        <h3>{{ $t('Profile.deleteAccount') }}</h3>
        <p class="input-large">
          <input type="checkbox" id="delete" required>
          <label for="delete">{{ $t('Profile.iwant') }}</label>
        </p>
        <input type="submit" class="btn btn-required btn-warning" @click="confirmDelete" :value="$t('Profile.deleteAccount')" disabled>
        <div id="deleteUserReturn"></div>
      </form>
    </fieldset>
  </div>
</template>

<script>
export default {
  name: 'profile',
  data () {
    return {
      id: null,
      login: null,
      email: null,
      doubleAuth: false,
      fields: {}
    }
  },
  methods: {
    changeLogin () {},
    changeMail () {},
    changePassword () {},
    changeCek () {},
    switchTheme () {},
    changeAuth () {},
    confirmDelete () {}
  },
  computed: {
    isComplete () {
      let complete = true
      for (let key of Object.keys(this.fields)) {
        if (this.fields[key].required && (this.fields[key].value === '' || this.fields[key].value === false)) {
          complete = false
          break
        }
      }
      return complete
    }
  },
  created () {
    if (!this.$parent.isLogged()) {
      this.$parent.logout()
      return false
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
