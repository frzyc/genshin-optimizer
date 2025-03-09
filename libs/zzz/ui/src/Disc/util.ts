import type {
  DiscMainStatKey,
  DiscSubStatKey,
} from '@genshin-optimizer/zzz/consts'
import { useEffect, useRef, useState } from 'react'

export const discLevelVariant = (level: number) =>
  ('roll' + (Math.floor(Math.max(level, 0) / 3) + 1)) as RollColorKey

export const allRollColorKeys = [
  'roll1',
  'roll2',
  'roll3',
  'roll4',
  'roll5',
  'roll6',
] as const
export type RollColorKey = (typeof allRollColorKeys)[number]

const showPercentKeys = ['hp_', 'def_', 'atk_'] as const
/**
 * Special consideration for disc stats, only display percentage for hp_, atk_ and def_ to distinguish between flat stats.
 */
export function discStatPercent(statkey: DiscMainStatKey | DiscSubStatKey) {
  return showPercentKeys.includes(statkey as (typeof showPercentKeys)[number])
    ? '%'
    : ''
}

export function useSpinner() {
  // spinner image state data
  const [rotation, setRotation] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const dragging = useRef(false)
  const lastAngle = useRef(0)
  const lastTime = useRef(Date.now())
  const center = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault()

    const rect = (e as any).target.getBoundingClientRect() as DOMRect
    center.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
    dragging.current = true
    lastAngle.current = Math.atan2(
      e.clientY - center.current.y,
      e.clientX - center.current.x
    )
    lastTime.current = Date.now()
    setVelocity(0)
  }

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault()
    if (!dragging.current) return
    const now = Date.now()
    const deltaTime = now - lastTime.current

    const angle = Math.atan2(
      e.clientY - center.current.y,
      e.clientX - center.current.x
    )
    const deltaAngle = (angle - lastAngle.current) * (180 / Math.PI)

    setRotation((prev) => prev + deltaAngle)
    setVelocity((deltaAngle / deltaTime) * 20)
    lastAngle.current = angle
    lastTime.current = now
  }

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault()
    dragging.current = false
  }

  useEffect(() => {
    if (!dragging.current) {
      const momentum = setInterval(() => {
        setRotation((prev) => {
          if (Math.abs(velocity) < 0.1) {
            clearInterval(momentum)
            return prev
          }
          setVelocity((v) => v * 0.98)
          return prev + velocity
        })
      }, 16)
      return () => clearInterval(momentum)
    }
    return () => {}
  }, [velocity])

  return {
    rotation,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging: dragging.current,
  }
}
