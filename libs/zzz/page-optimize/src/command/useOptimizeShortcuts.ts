import { useEffect } from 'react'

export function useOptimizeShortcuts({
  onOpenCharacter,
  onOpenTarget,
  enabled,
}: {
  onOpenCharacter: () => void
  onOpenTarget: () => void
  enabled: boolean
}) {
  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      const key = e.key.toLowerCase()
      if (key === 'k') {
        e.preventDefault()
        if (e.shiftKey) onOpenTarget()
        else onOpenCharacter()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, onOpenCharacter, onOpenTarget])
}
