import * as AssetData_gen from './AssetsData_gen.json'
import type { AssetData as AssetDataType } from './executors/gen-assets-data/executor'

export const AssetData = AssetData_gen as AssetDataType

export const CommonAssetData = {
  tabIcons: {
    character: 'SpriteOutput/PhoneAPPIcon/AvatarIcon.png',
    lightCone: 'SpriteOutput/UI/Avatar/IconAvatarLightCone.png',
    relic: 'SpriteOutput/UI/Avatar/IconAvatarRelic.png',
    team: 'SpriteOutput/PhoneAPPIcon/TeamIcon.png',
  },
  relicSlotIcons: {
    head: 'SpriteOutput/UI/Avatar/Relic/IconRelicHead.png',
    hand: 'SpriteOutput/UI/Avatar/Relic/IconRelicHands.png',
    body: 'SpriteOutput/UI/Avatar/Relic/IconRelicBody.png',
    feet: 'SpriteOutput/UI/Avatar/Relic/IconRelicFoot.png',
    sphere: 'SpriteOutput/UI/Avatar/Relic/IconRelicNeck.png',
    rope: 'SpriteOutput/UI/Avatar/Relic/IconRelicGoods.png',
  },
  charTabIcons: {
    details: 'SpriteOutput/UI/Avatar/IconAvatarDetail.png',
    traces: 'SpriteOutput/UI/Avatar/IconAvatarPaths.png',
    eidolon: 'SpriteOutput/UI/Avatar/IconAvatarRank.png',
  },
  elemIcons: {
    physical: 'SpriteOutput/UI/Nature/IconAttribute/IconAttributePhysical.png',
    quantum: 'SpriteOutput/UI/Nature/IconAttribute/IconAttributeQuantum.png',
    lightning: 'SpriteOutput/UI/Nature/IconAttribute/IconAttributeThunder.png',
    ice: 'SpriteOutput/UI/Nature/IconAttribute/IconAttributeIce.png',
    wind: 'SpriteOutput/UI/Nature/IconAttribute/IconAttributeWind.png',
    fire: 'SpriteOutput/UI/Nature/IconAttribute/IconAttributeFire.png',
    imaginary:
      'SpriteOutput/UI/Nature/IconAttribute/IconAttributeImaginary.png',
  },
  whiteElemIcons: {
    physical: 'SpriteOutput/UI/Nature/IconWhite/IconWhitePhysical.png',
    quantum: 'SpriteOutput/UI/Nature/IconWhite/IconWhiteQuantum.png',
    lightning: 'SpriteOutput/UI/Nature/IconWhite/IconWhiteThunder.png',
    ice: 'SpriteOutput/UI/Nature/IconWhite/IconWhiteIce.png',
    wind: 'SpriteOutput/UI/Nature/IconWhite/IconWhiteWind.png',
    fire: 'SpriteOutput/UI/Nature/IconWhite/IconWhiteFire.png',
    imaginary: 'SpriteOutput/UI/Nature/IconWhite/IconWhiteImaginary.png',
  },
}
