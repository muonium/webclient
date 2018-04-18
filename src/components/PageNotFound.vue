<template>
  <div class="container-small">
    <vue-headful
      v-if="!this.$parent.loading"
      :title="Muonium - $t('Error.e404')"
    />
    <p class="red return">{{ $t('Error.e404') }}</p>
  </div>
</template>

<script>
export default {
  name: 'PageNotFound'
}
</script>
