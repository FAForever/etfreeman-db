import { computed } from 'vue'

export function useMods(props, base, mods) {
  const modlist = computed(() => {
    const ar = []
    for (let modname in mods) {
      const v = props[modname] || mods[modname]
      if (!v) continue

      if (Array.isArray(v)) {
        v.forEach(val => {
          if (val) ar.push(base + '_' + modname + '-' + val)
        })
      } else {
        ar.push(base + '_' + modname + '-' + v)
      }
    }
    return ar
  })

  return { mods: modlist }
}
