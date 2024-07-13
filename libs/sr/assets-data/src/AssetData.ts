import { dumpFile } from '@genshin-optimizer/common/pipeline'
import type {
  CharacterDataKey,
  LightConeKey,
  RelicCavernSetKey,
  RelicCavernSlotKey,
  RelicPlanarSetKey,
  RelicPlanarSlotKey,
} from '@genshin-optimizer/sr/consts'
import {
  avatarConfig,
  characterIdMap,
  equipmentConfig,
  lightConeIdMap,
  relicDataInfo,
  relicSetIdMap,
  relicSlotMap,
} from '@genshin-optimizer/sr/dm'
import { workspaceRoot } from '@nx/devkit'

type CharacterIcon = {
  icon: string
}

type LightConeIcon = {
  icon: string
  cover: string
}

type RelicPlanarIcons = Record<
  RelicPlanarSetKey,
  Record<RelicPlanarSlotKey, string>
>
type RelicCavernIcons = Record<
  RelicCavernSetKey,
  Record<RelicCavernSlotKey, string>
>
type RelicIcons = RelicPlanarIcons & RelicCavernIcons
//An object to store all the asset related data.
export const AssetData = {
  // artifacts: {},
  lightCones: {} as Record<LightConeKey, LightConeIcon>,
  chars: {} as Record<CharacterDataKey, CharacterIcon>,
  relic: {} as RelicIcons,
}

// Get icons for each relic piece
AssetData.relic = Object.fromEntries(
  Object.entries(relicDataInfo).map(([relicSetId, reflicDatas]) => [
    relicSetIdMap[relicSetId],
    Object.fromEntries(
      Object.entries(reflicDatas).map(([relicSlotKey, relicData]) => [
        relicSlotMap[relicSlotKey],
        relicData.ItemFigureIconPath,
      ])
    ),
  ])
) as RelicIcons

// parse baseStat/ascension/basic data for characters.
Object.entries(avatarConfig).forEach(([charid, charData]) => {
  const { DefaultAvatarHeadIconPath } = charData

  const assets: CharacterIcon = {
    icon: DefaultAvatarHeadIconPath.toLocaleLowerCase(),
  }
  AssetData.chars[characterIdMap[charid]] = assets
})

Object.entries(equipmentConfig).forEach(([id, data]) => {
  const { ThumbnailPath, ImagePath } = data

  const assets: LightConeIcon = {
    icon: ThumbnailPath.toLocaleLowerCase(),
    cover: ImagePath.toLocaleLowerCase(),
  }
  AssetData.lightCones[lightConeIdMap[id]] = assets
})

// Dump out the asset List.
dumpFile(
  `${workspaceRoot}/libs/sr/assets-data/src/lib/AssetData_gen.json`,
  AssetData
)
