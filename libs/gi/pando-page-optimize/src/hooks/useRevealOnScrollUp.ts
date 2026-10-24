import { useEffect, useRef, useState } from 'react'

const TOP_ALWAYS_VISIBLE_PX = 16
const MIN_SCROLL_BEFORE_HIDE_PX = 72
const SCROLL_DELTA_PX = 6

/**
 * Reddit-style mobile chrome: hide while scrolling down, show on scroll up.
 */
export function useRevealOnScrollUp({ enabled }: { enabled: boolean }) {
  const [visible, setVisible] = useState(true)
  const lastYRef = useRef(0)
  const visibleRef = useRef(true)

  useEffect(() => {
    if (!enabled) {
      setVisible(true)
      visibleRef.current = true
      return
    }

    lastYRef.current = window.scrollY

    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        const y = window.scrollY
        const delta = y - lastYRef.current

        if (y <= TOP_ALWAYS_VISIBLE_PX) {
          if (!visibleRef.current) {
            visibleRef.current = true
            setVisible(true)
          }
        } else if (delta > SCROLL_DELTA_PX && y > MIN_SCROLL_BEFORE_HIDE_PX) {
          if (visibleRef.current) {
            visibleRef.current = false
            setVisible(false)
          }
        } else if (delta < -SCROLL_DELTA_PX) {
          if (!visibleRef.current) {
            visibleRef.current = true
            setVisible(true)
          }
        }

        lastYRef.current = y
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [enabled])

  return visible
}
