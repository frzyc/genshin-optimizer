import type { CharacterKey } from '@genshin-optimizer/consts'
import { characterAsset } from '@genshin-optimizer/gi-assets'
import { portrait } from '@genshin-optimizer/silly-wisher'
import type { Gender } from '../Types/consts'

export function iconAsset(cKey: CharacterKey, gender: Gender, silly: boolean) {
  const sillyAsset = portrait(cKey, gender)
  const genshinAsset = characterAsset(cKey, 'icon', gender)
  if (silly && sillyAsset) return sillyAsset
  return genshinAsset || ''
}
