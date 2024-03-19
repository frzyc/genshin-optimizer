import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { useEffect, useState } from 'react'
import { useOnScreen } from './useOnScreen'

/**
 * A utility function to help implementation of an infinite scroll.
 * @param increment the increment to increase every time the scroll element is triggered
 * @param max the maximum number of elements
 * @returns {Object}
 */
export function useInfScroll(increment: number, max: number) {
  const [numShow, setNumShow] = useState(increment)
  const [triggerElement, setTriggerElement] = useState<
    HTMLElement | undefined
  >()
  const trigger = useOnScreen(triggerElement)
  const [retryScroll, setRetryScroll] = useForceUpdate()
  const shouldIncrease = trigger && numShow < max
  // reset the numShow when max or increment changes, usually an indication that the UI has drastically updated or resized.
  useEffect(() => {
    max && setNumShow(increment)
  }, [max, increment])

  useEffect(() => {
    if (!shouldIncrease) return
    retryScroll && setNumShow((num) => num + increment)

    // Use a timeout for cases where the the infinite scrolling didn't add enough items to push the trigger out of view.
    const timeout = setTimeout(() => setRetryScroll(), 1000)
    return () => clearTimeout(timeout)
  }, [retryScroll, shouldIncrease, increment, setRetryScroll])

  return { numShow, setTriggerElement }
}
