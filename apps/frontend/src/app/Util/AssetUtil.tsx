import type { CharacterKey, GenderKey } from '@genshin-optimizer/gi/consts'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import { portrait } from '@genshin-optimizer/gi/silly-wisher'

export function iconAsset(
  cKey: CharacterKey,
  gender: GenderKey,
  silly: boolean
) {
  const sillyAsset = portrait(cKey, gender)
  const genshinAsset = characterAsset(cKey, 'icon', gender)
  if (silly && sillyAsset) return sillyAsset
  return genshinAsset || ''
}
