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
  avatarRankConfig,
  avatarSkillTreeConfig,
  characterIdMap,
  equipmentConfig,
  lightConeIdMap,
  relicDataInfo,
  relicSetIdMap,
  relicSlotMap,
} from '@genshin-optimizer/sr/dm'
import type { PromiseExecutor } from '@nx/devkit'
import { workspaceRoot } from '@nx/devkit'
import type { GenAssetsDataExecutorSchema } from './schema'

type CharacterIcon = {
  icon: string
  basic: string
  skill: string
  ult: string
  talent: string
  technique: string
  overworld: string
  bonusAbility1: string
  bonusAbility2: string
  bonusAbility3: string
  eidolon1: string
  eidolon2: string
  eidolon3: string
  eidolon4: string
  eidolon5: string
  eidolon6: string
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
// An object to store all the asset related data.
const assetData = {
  // artifacts: {},
  lightCones: {} as Record<LightConeKey, LightConeIcon>,
  chars: {} as Record<CharacterDataKey, CharacterIcon>,
  relic: {} as RelicIcons,
}
export type AssetData = typeof assetData

const runExecutor: PromiseExecutor<GenAssetsDataExecutorSchema> = async (
  options
) => {
  console.log('Executor ran for GenAssetsData', options)

  // Get icons for each relic piece
  assetData.relic = Object.fromEntries(
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
  Object.entries(avatarConfig).forEach(([avatarId, charData]) => {
    const { DefaultAvatarHeadIconPath } = charData
    const [
      basic,
      skill,
      ult,
      talent,
      technique,
      overworld,
      bonusAbility1,
      bonusAbility2,
      bonusAbility3,
    ] = Object.values(avatarSkillTreeConfig[avatarId]).map(
      // Grab the first level; we just need the image names
      (skillTree) => skillTree[0]
    )

    const [e1, e2, e3, e4, e5, e6] = Object.values(avatarRankConfig[avatarId])

    const assets: CharacterIcon = {
      icon: DefaultAvatarHeadIconPath,
      basic: basic.IconPath,
      skill: skill.IconPath,
      ult: ult.IconPath, // TODO: Maybe switch tot
      talent: talent.IconPath,
      technique: technique.IconPath,
      overworld: overworld.IconPath,
      bonusAbility1: bonusAbility1.IconPath,
      bonusAbility2: bonusAbility2.IconPath,
      bonusAbility3: bonusAbility3.IconPath,
      eidolon1: e1.IconPath,
      eidolon2: e2.IconPath,
      eidolon3: e3.IconPath,
      eidolon4: e4.IconPath,
      eidolon5: e5.IconPath,
      eidolon6: e6.IconPath,
    }
    assetData.chars[characterIdMap[avatarId]] = assets
  })

  Object.entries(equipmentConfig).forEach(([id, data]) => {
    const { ThumbnailPath, ImagePath } = data

    const assets: LightConeIcon = {
      icon: ThumbnailPath,
      cover: ImagePath,
    }
    assetData.lightCones[lightConeIdMap[id]] = assets
  })

  // Dump out the asset List.
  dumpFile(
    `${workspaceRoot}/libs/sr/assets-data/src/AssetsData_gen.json`,
    assetData
  )

  return {
    success: true,
  }
}

export default runExecutor
