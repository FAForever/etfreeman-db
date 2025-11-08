export const getUnitNumber = (id) => (id.slice(-4).match(/\d+$/)?.[0] || 0) - 0

export const getFactionCode = (id) => id.slice(0, 3)
