export const formatNum = (val) => {
  const num = typeof val === 'number' ? val : (typeof val === 'string' && val.trim() && !isNaN(val) ? Number(val) : null)
  if (num === null) return val
  const parts = num.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F')
  return parts.join('.')
}

export const shorten = (num, locale = true) => {
  let short, localed = locale ? formatNum(num) : (num + '')
  if (num > 1e9 - 1) short =  num / 1e9 + 'B'
  else if (num > 1e6 - 1) short = num / 1e6 + 'M'
  else if (num > 999) short = num / 1000 + 'k'
  if (short && short.length < localed.length) return short
  return localed
}

export const shortenIfPossible = (val) => {
  if (typeof val === 'number') return shorten(val)
  return val
}

export const round = (value, decimals = 0) => {
  const multiplier = 10 ** decimals
  return Math.round((value || 0) * multiplier) / multiplier
}

export const roundIfPossible = (value, decimals) => {
  if (typeof value === 'number') return round(value, decimals)
  return value
}

export const formatTime = (seconds) => {
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = String(Math.floor(seconds % 60)).padStart(2, '0')
  return `${mins}:${secs}`
}

export const addBr = (str, limit = 10) => {
  const words = str.split(' ')
  let res = [words[0]||''], current = words[0]?.length || 0
  for (let i = 1; i < words.length; i++) {
    if (current + words[i].length + 1 <= limit) {
      res.push(words[i])
      current += words[i].length + 1
    } else {
      res.push('<br>', words[i])
      current = words[i].length
    }
  }
  return res.join(' ')
}

export const throttle = (fn, ms) => {
  let queued = false
  let lastArgs
  return (...args) => {
    lastArgs = args
    if (queued) return
    queued = true
    setTimeout(() => {
      queued = false
      fn(...lastArgs)
    }, ms)
  }
}