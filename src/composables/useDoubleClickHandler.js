const maxDoubleClickDelay = 200

export function useDoubleClickHandler({ clickFunction, doubleClickFunction }) {
  let lastClickTime = 0
  let lastTarget = null

  const handleClick = (e, ...args) => {
    const now = performance.now()
    const isDoubleClick = (now - lastClickTime) < maxDoubleClickDelay
    const sameTarget = lastTarget === e.currentTarget
    lastClickTime = now
    lastTarget = e.currentTarget

    if (isDoubleClick && sameTarget) doubleClickFunction(...args)
    else clickFunction(...args)
  }

  return { handleClick }
}
