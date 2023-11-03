import type { StaticImageData } from 'next/image'

import type { CharacterKey, GenderKey } from '@genshin-optimizer/consts'
import { characterAsset } from '@genshin-optimizer/gi-assets'
import { portrait } from '@genshin-optimizer/silly-wisher'

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

export function assetWrapper(src: unknown) {
  if (typeof src === 'string') return { src } as StaticImageData
  else return src as StaticImageData
}
