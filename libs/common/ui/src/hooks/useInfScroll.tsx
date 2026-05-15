import { useEffect, useState } from 'react'
import { useOnScreen } from './useOnScreen'
import { usePrev } from './usePrev'

/**
 * A utility function to help implementation of an infinite scroll.
 * @param increment the increment to increase every time the scroll element is triggered
 * @param max the maximum number of elements
 * @returns {Object}
 */
export function useInfScroll(increment: number, max: number) {
  const [numShow, setNumShow] = useState(increment)
  // reset the numShow when max or increment changes, usually an indication that the UI has drastically updated or resized.
  const maxChanged = usePrev(max) !== max
  const incrementChanged = usePrev(increment) !== increment
  if (maxChanged || incrementChanged) setNumShow(increment)
  const [triggerElement, setTriggerElement] = useState<
    HTMLElement | undefined
  >()
  const trigger = useOnScreen(triggerElement)

  useEffect(() => {
    const shouldIncrease = trigger && numShow < max
    if (shouldIncrease) setNumShow((num) => num + increment)
  }, [increment, numShow, trigger, max])

  return { numShow, setTriggerElement }
}
