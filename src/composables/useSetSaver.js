import { ref, watch } from 'vue'

export function useSetSaver(key, defaults) {
  const stored = localStorage.getItem(key)
  const state = ref(stored ? new Set(JSON.parse(stored)) : new Set(defaults))

  watch(state, val => localStorage.setItem(key, JSON.stringify([...val])), { deep: true })

  return state
}
