<template>
  <div class="progress_bar">
    <div class="used" :style="'width:' + pct + '%'"></div>
  </div>
</template>

<script>
export default {
  name: 'progress_bar',
  props: {
    pct: {
      type: Number,
      required: true
    }
  }
}
</script>

<style src="../assets/css/Interface/progress_bar.css"></style>
