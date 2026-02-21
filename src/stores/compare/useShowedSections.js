import { reactive } from 'vue'

const DEFAULTS = {
  Defense: true, Economy: true, Offense: true, Physics: true,
  Abilities: true, Intel: true, Transport: true, Veterancy: true,
  Wreckage: true, Enhancements: true
}

export function useShowedSections() {
  const showedSections = reactive({ ...DEFAULTS })
  const toggleSection = (section) => showedSections[section] = !showedSections[section]

  return { showedSections, toggleSection }
}
