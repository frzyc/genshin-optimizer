import type {
  CharacterGenderedKey,
  CharacterKey,
} from '@genshin-optimizer/sr/consts'
import {
  type LightConeKey,
  type NonTrailblazerCharacterKey,
  type RelicSetKey,
  type RelicSlotKey,
  type TrailblazerGenderedKey,
  isTrailblazerKey,
} from '@genshin-optimizer/sr/consts'
import chars from './gen/chars'
import lightCones from './gen/lightCones'
import relics from './gen/relics'
type characterAssetKey =
  | 'icon'
  | 'basic_0'
  | 'skill_0'
  | 'ult_0'
  | 'talent_0'
  | 'technique_0'
  | 'eidolon1'
  | 'eidolon2'
  | 'eidolon3'
  | 'eidolon4'
  | 'eidolon5'
  | 'eidolon6'
  | 'overworld_0'
  | 'bonusAbility1'
  | 'bonusAbility2'
  | 'bonusAbility3'

export function characterAsset(
  ck: CharacterGenderedKey,
  asset: characterAssetKey
) {
  return chars[ck][asset]
}
export function characterKeyToGenderedKey(
  ck: CharacterKey
): CharacterGenderedKey {
  if (isTrailblazerKey(ck)) {
    // TODO: implement gender
    return `${ck}F` as TrailblazerGenderedKey
  }
  return ck as NonTrailblazerCharacterKey
}
type LightConeAssetKey = 'icon' | 'cover'
export function lightConeAsset(lck: LightConeKey, asset: LightConeAssetKey) {
  return lightCones[lck][asset]
}

export function relicAsset(rk: RelicSetKey, slotKey: RelicSlotKey) {
  const relic = relics[rk]

  return relic[slotKey as keyof typeof relic]
}
