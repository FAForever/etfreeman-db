import { computed, unref } from 'vue'

export const useStatRows = (dataGetter, config) => {
  return computed(() => {
    const data = unref(dataGetter)
    if (!data) return []

    return config
      .filter(row => {
        const value = typeof row.key === 'function'
          ? row.key(data)
          : data[row.key]
        return value !== undefined && value !== null
      })
      .map(row => {
        const value = typeof row.key === 'function'
          ? row.key(data)
          : data[row.key]

        return {
          label: row.label,
          value: row.formatter ? row.formatter(value, data) : value,
          title: row.title,
          fullValue: row.fullValue
        }
      })
  })
}
