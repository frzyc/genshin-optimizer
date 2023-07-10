import type { CharacterKey, LightConeKey } from '@genshin-optimizer/sr-consts'
// import artifacts from './gen/artifacts'
// import chars from './gen/chars'
// import lightcones from './gen/lightCones'
type characterAssetKey = 'icon' | 'cover'
export function characterAsset(
  ck: CharacterKey,
  asset: characterAssetKey
): string {
  switch (asset) {
    case 'icon':
    default:
      // return chars[ck][asset] ?? ''
      throw 'TODO'
  }
}
export function lightConeAsset(lck: LightConeKey) {
  // return lightcones[lck]
  throw 'TODO'
}
// export function artifactAsset(
//   ak: ArtifactSetKey,
//   slotKey: ArtifactSlotKey
// ): string {
//   return artifacts[ak][slotKey] ?? ''
// }
