import type { StatKey } from '@genshin-optimizer/zzz/consts'
import { createContext } from 'react'

export const StatHighlightContext = createContext({
  statHighlight: '',
  setStatHighlight: () => {},
} as {
  statHighlight: string
  setStatHighlight: (highlight: string) => void
})

export function isHighlight(hightlight: string, statKey: StatKey) {
  if (hightlight.endsWith('_dmg_')) return hightlight === statKey

  return hightlight.replace(/_$/, '') === statKey.replace(/_$/, '')
}
const HILIGHT_RGBA = 'rgba(200,200,200,0.2)'
const NOLIGHT_RGBA = 'rgba(200,200,200,0)'
export function getHighlightRGBA(isHiglight: boolean) {
  return isHiglight ? HILIGHT_RGBA : NOLIGHT_RGBA
}
