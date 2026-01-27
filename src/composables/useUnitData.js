import { storeToRefs } from 'pinia'
import { useUnitDataStore } from '../stores/unitData.js'

export function useUnitData() {
  const store = useUnitDataStore()
  const refs = storeToRefs(store)

  return { ...store, ...refs }
}
