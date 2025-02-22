'use client'
import { useEffect, useRef, useState } from 'react'

export function useRefOverflow() {
  const ref = useRef<HTMLElement>()

  const [isOverflowX, setIsOverflowX] = useState(false)
  const [isOverflowY, setIsOverflowY] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const ele = ref.current
      setIsOverflowX(ele ? isOverflowedX(ele) : false)
      setIsOverflowY(ele ? isOverflowedY(ele) : false)
    }
    handleResize() // Check on mount and whenever the window resizes
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, []) // Safe to keep empty as we only want mount/unmount behavior
  return { isOverflowX, isOverflowY, ref }
}
function isOverflowedX(ref: HTMLElement) {
  return ref.scrollWidth > ref.clientWidth
}

function isOverflowedY(ref: HTMLElement) {
  return ref.scrollHeight > ref.clientHeight
}
