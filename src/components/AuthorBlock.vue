<script setup>

</script>

<template>
  <div class="author">
    <a href="https://boosty.to/etfreeman" target="_blank" class="author__link">
      <span class="author__link-emoji">❤️</span> support<br> the author
    </a>
  </div>
</template>

<style lang="sass">
.author
  padding: 0 10px
  @include for-mob
    padding: 10px 0 5px
    &__link
      width: fit-content
      margin: 0 auto
      br
        display: none
  &__link
    opacity: .5
    text-align: center
    font-size: 12px
    &-emoji 
      opacity: .5
    &:hover
      opacity: 1
      .author__link-emoji
        opacity: 1

</style>