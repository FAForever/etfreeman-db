export const shorten = (num) => {
  if (num > 1e9 - 1) return num / 1e9 + 'B'
  if (num > 1e6 - 1) return num / 1e6 + 'M'
  if (num > 999) return num / 1000 + 'k'
  return num
}

export const round = (value, decimals = 0) => {
  const multiplier = 10 ** decimals
  return Math.round((value || 0) * multiplier) / multiplier
}

export const formatTime = (seconds) => {
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = String(Math.floor(seconds % 60)).padStart(2, '0')
  return `${mins}:${secs}`
}
