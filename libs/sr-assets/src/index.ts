import type { CharacterKey, LightConeKey } from '@genshin-optimizer/sr-consts'
// import artifacts from './gen/artifacts'
// import chars from './gen/chars'
// import lightCones from './gen/lightCones'
type characterAssetKey = 'icon' | 'cover'
export function characterAsset(
  _ck: CharacterKey,
  asset: characterAssetKey
): string {
  switch (asset) {
    case 'icon':
    default:
      // return chars[ck][asset] ?? ''
      throw new Error('TODO')
  }
}
export function lightConeAsset(_lck: LightConeKey) {
  // return lightCones[lck]
  throw new Error('TODO')
}
// export function artifactAsset(
//   ak: ArtifactSetKey,
//   slotKey: ArtifactSlotKey
// ): string {
//   return artifacts[ak][slotKey] ?? ''
// }
