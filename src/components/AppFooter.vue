<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p>&copy; 2025 Forged Alliance Forever</p>
      <p>Unit Database v{{ version || '1.0' }}</p>
      <p>
        <a class="calm" href="https://github.com/FAForever/etfreeman-db" target="_blank" rel="noopener">
          View on GitHub
        </a>
      </p>
    </div>
  </footer>
</template>

<script setup>
import { useUnitData } from '../composables/useUnitData.js'

const { version } = useUnitData()
</script>

<style lang="sass">
.app-footer
  font-size: .8em
  background: #333
  color: white
  padding: 1rem
  text-align: center
  margin-top: 2rem

.footer-content
  display: flex
  flex-direction: column
  align-items: center
  p
    margin: 0.25rem 0

  a
    color: #007bff

</style>