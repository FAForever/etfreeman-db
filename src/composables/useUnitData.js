import { storeToRefs } from 'pinia'
import { useUnitDataStore } from '@/stores/unitData.js'

let data

export function useUnitData() {
  if (data) return data
  const store = useUnitDataStore()
  const refs = storeToRefs(store)
  data = { ...store, ...refs }
  return data
}
