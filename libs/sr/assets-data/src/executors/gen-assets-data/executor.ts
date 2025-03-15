import { dumpFile } from '@genshin-optimizer/common/pipeline'
import type {
  CharacterGenderedKey,
  LightConeKey,
  RelicCavernSetKey,
  RelicCavernSlotKey,
  RelicPlanarSetKey,
  RelicPlanarSlotKey,
} from '@genshin-optimizer/sr/consts'
import type { RelicSlotDMKey } from '@genshin-optimizer/sr/dm'
import {
  avatarConfig,
  avatarRankConfig,
  avatarSkillConfig,
  avatarSkillTreeConfig,
  characterIdMap,
  DmAttackTypeMap,
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
  basic: string[]
  skill: string[]
  ult: string[]
  talent: string[]
  technique: string[]
  overworld: string[]
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
  chars: {} as Record<CharacterGenderedKey, CharacterIcon>,
  relics: {} as RelicIcons,
}
export type AssetData = typeof assetData

const runExecutor: PromiseExecutor<GenAssetsDataExecutorSchema> = async (
  options,
) => {
  console.log('Executor ran for GenAssetsData', options)

  // Get icons for each relic piece
  assetData.relics = Object.fromEntries(
    Object.entries(relicDataInfo)
      .filter(([relicSetId]) => !!relicSetIdMap[relicSetId])
      .map(([relicSetId, relicDatas]) => [
        relicSetIdMap[relicSetId],
        Object.fromEntries(
          Object.entries(relicDatas).map(([relicSlotKey, relicData]) => [
            relicSlotMap[relicSlotKey as RelicSlotDMKey],
            relicData.ItemFigureIconPath,
          ]),
        ),
      ]),
  ) as RelicIcons

  // parse baseStat/ascension/basic data for characters.
  Object.entries(avatarConfig).forEach(([avatarId, charData]) => {
    const { DefaultAvatarHeadIconPath, SkillList } = charData
    const [eidolon1, eidolon2, eidolon3, eidolon4, eidolon5, eidolon6] =
      Object.values(avatarRankConfig[avatarId]).map((config) => config.IconPath)

    const [
      _basic,
      _skill,
      _ult,
      _talent,
      _technique,
      bonusAbility1,
      bonusAbility2,
      bonusAbility3,
    ] = Object.values(avatarSkillTreeConfig[avatarId]).map(
      // Grab the first level; we just need the image names
      (skillTree) => skillTree[0].IconPath,
    )

    const assets: CharacterIcon = {
      icon: DefaultAvatarHeadIconPath,
      basic: [],
      skill: [],
      ult: [],
      talent: [],
      technique: [],
      overworld: [],
      bonusAbility1,
      bonusAbility2,
      bonusAbility3,
      eidolon1,
      eidolon2,
      eidolon3,
      eidolon4,
      eidolon5,
      eidolon6,
    }

    SkillList.forEach((skillId) => {
      // Grab the first level; we just need the image names
      const { AttackType, SkillIcon } = avatarSkillConfig[skillId][0]
      const assetType = AttackType ? DmAttackTypeMap[AttackType] : 'talent'
      // TODO: Add memosprite support
      if (assetType === 'servantSkill' || assetType === 'servantTalent') return
      assets[assetType]?.push(SkillIcon)
    })

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
    assetData,
  )

  return {
    success: true,
  }
}

export default runExecutor
