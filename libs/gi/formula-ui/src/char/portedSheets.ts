import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { uiSheets } from './sheets'

export function isPortedCharacter(key: CharacterKey): boolean {
  return key in uiSheets
}
