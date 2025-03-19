import type {
  ArtifactSetKey,
  ArtifactSlotKey,
  CharacterKey,
  GenderKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { charKeyToLocGenderedCharKey } from '@genshin-optimizer/gi/consts'
import type { StaticImageData } from 'next/image'
import artifacts from './gen/artifacts'
import chars from './gen/chars'
import weapons from './gen/weapons'
export * from './assets'

type characterAssetKey =
  | 'icon'
  | 'iconSide'
  | 'banner'
  | 'bar'
  | 'skill'
  | 'burst'
  | 'passive1'
  | 'passive2'
  | 'passive3'
  | 'constellation1'
  | 'constellation2'
  | 'constellation3'
  | 'constellation4'
  | 'constellation5'
  | 'constellation6'
  | 'sprint'
  | 'passive'
export function characterAsset(
  ck: CharacterKey,
  asset: characterAssetKey,
  gender: GenderKey = 'F'
) {
  switch (asset) {
    case 'icon':
    case 'iconSide':
      return chars[charKeyToLocGenderedCharKey(ck, gender)][asset] //gender specific
    default:
      return (chars[ck] as Record<characterAssetKey, string | StaticImageData>)[
        asset
      ]
  }
}
export function artifactAsset(ak: ArtifactSetKey, slotKey: ArtifactSlotKey) {
  if (
    ak === 'PrayersForDestiny' ||
    ak === 'PrayersForIllumination' ||
    ak === 'PrayersForWisdom' ||
    ak === 'PrayersToSpringtime'
  )
    return artifacts[ak].circlet
  return artifacts[ak][slotKey]
}
export function artifactDefIcon(setKey: ArtifactSetKey) {
  return artifactAsset(setKey, 'flower') || artifactAsset(setKey, 'circlet')
}
export function weaponAsset(wk: WeaponKey, empowered = true) {
  return weapons[wk][empowered ? 'awakenIcon' : 'icon'] ?? weapons[wk].icon
}
