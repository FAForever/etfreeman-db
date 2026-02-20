import { ref, computed, onMounted, onUnmounted, inject } from 'vue'

export const useContainerWidth = (containerRef, scrollbarGap = 10) => {
  const rawWidth = ref(document.body.offsetWidth)
  const containerWidth = computed(() => rawWidth.value - scrollbarGap)

  const onResize = () => rawWidth.value = containerRef.value?.clientWidth ?? 0
  const resizeFunctions = inject('resizeFunctions')

  onMounted(() => {
    onResize()
    resizeFunctions.value.add(onResize)
  })

  onUnmounted(() => resizeFunctions.value.delete(onResize))

  return { containerWidth }
}
