<template>
  <div class="container-small">
    <vue-headful
      :title="$t('Error.e404')"
    />
    <p class="red">{{ $t('Error.e404') }}</p>
  </div>
</template>

<script>
export default {
  name: 'PageNotFound'
}
</script>
