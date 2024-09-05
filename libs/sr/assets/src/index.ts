import type {
  LightConeKey,
  NonTrailblazerCharacterKey,
  RelicSetKey,
  RelicSlotKey,
  TrailblazerGenderedKey,
} from '@genshin-optimizer/sr/consts'
import chars from './gen/chars'
import lightCones from './gen/lightCones'
import relics from './gen/relics'
type characterAssetKey = 'icon' | 'basic_0' | 'skill_0'
export function characterAsset(
  ck: NonTrailblazerCharacterKey | TrailblazerGenderedKey,
  asset: characterAssetKey
) {
  return chars[ck][asset]
}
type LightConeAssetKey = 'icon' | 'cover'
export function lightConeAsset(lck: LightConeKey, asset: LightConeAssetKey) {
  return lightCones[lck][asset]
}

export function relicAsset(rk: RelicSetKey, slotKey: RelicSlotKey) {
  const relic = relics[rk]

  return relic[slotKey as keyof typeof relic]
}
