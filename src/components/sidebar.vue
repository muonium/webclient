<template>
  <div class="sidebar">
    <ul>
      <li>
        <router-link :to="'/u/' + this.$parent.folder_id">
          <i class="fa fa-file" aria-hidden="true"></i>
        </router-link>
      </li>
      <li>
        <a href="User#trash">
          <i class="fa fa-trash" aria-hidden="true"></i>
        </a>
      </li>
      <li>
        <a href="User#transfers">
          <i class="fa fa-exchange" aria-hidden="true"></i>
        </a>
      </li>
      <li>
        <router-link to="/bug">
          <i class="fa fa-bug" aria-hidden="true"></i>
        </router-link>
      </li>
      <li>
        <router-link to="/profile">
          <i class="fa fa-cog" aria-hidden="true"></i>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'sidebar'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
