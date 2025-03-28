import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { layeredAssignment } from '@genshin-optimizer/common/util'
import type {
  ArtifactSetKey,
  ArtifactSlotKey,
  LocationGenderedCharacterKey,
  TravelerKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import type {
  AvatarSkillDepotExcelConfigData,
  CharacterId,
  WeaponId,
} from '@genshin-optimizer/gi/dm'
import {
  artifactIdMap,
  artifactSlotMap,
  avatarExcelConfigData,
  avatarSkillDepotExcelConfigData,
  avatarSkillExcelConfigData,
  avatarTalentExcelConfigData,
  characterIdMap,
  fetterCharacterCardExcelConfigData,
  materialExcelConfigData,
  proudSkillExcelConfigData,
  reliquaryExcelConfigData,
  reliquarySetExcelConfigData,
  rewardExcelConfigData,
  weaponExcelConfigData,
  weaponIdMap,
} from '@genshin-optimizer/gi/dm'
import type { PromiseExecutor } from '@nx/devkit'
import { workspaceRoot } from '@nx/devkit'
import type { GenAssetsDataExecutorSchema } from './schema'

const proj_path = `${workspaceRoot}/libs/gi/assets-data`

// An object to store all the asset related data.
const assetData = {
  weapons: {} as Record<WeaponKey, { icon: string; awakenIcon: string }>,
  artifacts: {} as Record<
    ArtifactSetKey,
    Partial<Record<ArtifactSlotKey, string>>
  >,
  chars: {} as CharacterIconData,
}
export type AssetData = typeof assetData

type CharacterIcon = {
  icon?: string
  iconSide?: string
  banner?: string
  bar?: string
  skill?: string
  burst?: string
  sprint?: string
  passive1?: string
  passive2?: string
  passive3?: string
  passive?: string
  constellation1?: string
  constellation2?: string
  constellation3?: string
  constellation4?: string
  constellation5?: string
  constellation6?: string
}
type CharacterIconData = Record<
  LocationGenderedCharacterKey | TravelerKey,
  CharacterIcon
>

const runExecutor: PromiseExecutor<GenAssetsDataExecutorSchema> = async (
  options
) => {
  console.log('Executor ran for GenAssetsData', options)

  // Get icons for each artifact piece
  Object.entries(reliquarySetExcelConfigData).forEach(([setId, data]) => {
    const { equipAffixId, containsList } = data
    if (!equipAffixId) return

    const pieces = Object.fromEntries(
      containsList.map((pieceId) => {
        const pieceData = reliquaryExcelConfigData[pieceId]
        if (!pieceData)
          throw new Error(`No piece data with id ${pieceId} in setId ${setId}`)
        const { icon, equipType } = pieceData
        return [artifactSlotMap[equipType], icon]
      })
    ) as Partial<Record<ArtifactSlotKey, string>>

    assetData.artifacts[artifactIdMap[setId]] = pieces
  })

  // Get the icon/awakened for each weapon
  Object.entries(weaponExcelConfigData).forEach(([weaponid, weaponData]) => {
    const { icon, awakenIcon } = weaponData
    assetData.weapons[weaponIdMap[weaponid as WeaponId]] = {
      icon,
      awakenIcon,
    }
  })

  // parse baseStat/ascension/basic data for characters.
  Object.entries(avatarExcelConfigData).forEach(([charid, charData]) => {
    const { iconName, sideIconName } = charData

    let banner, bar
    if (fetterCharacterCardExcelConfigData[charid as CharacterId]) {
      const { rewardId } = fetterCharacterCardExcelConfigData[charid]
      const { rewardItemList } = rewardExcelConfigData[rewardId]
      const { itemId } = rewardItemList[0]
      ;({
        picPath: [bar, banner],
      } = materialExcelConfigData[itemId])
    }
    const assets = banner
      ? {
          icon: iconName,
          iconSide: sideIconName,
          banner,
          bar: bar!,
        }
      : {
          icon: iconName,
          iconSide: sideIconName,
        }
    assetData.chars[characterIdMap[charid]] = assets
  })

  const assetChar = assetData.chars
  Object.entries(avatarExcelConfigData).forEach(([charid, charData]) => {
    const { iconName, sideIconName, skillDepotId, candSkillDepotIds } = charData

    const cKey = characterIdMap[charid]
    layeredAssignment(assetChar, [cKey, 'icon'], iconName)
    layeredAssignment(assetChar, [cKey, 'iconSide'], sideIconName)

    if (fetterCharacterCardExcelConfigData[charid]) {
      const { rewardId } = fetterCharacterCardExcelConfigData[charid]
      const { rewardItemList } = rewardExcelConfigData[rewardId]
      const { itemId } = rewardItemList[0]
      const {
        picPath: [bar, banner],
      } = materialExcelConfigData[itemId]
      bar && layeredAssignment(assetChar, [cKey, 'bar'], bar)
      banner && layeredAssignment(assetChar, [cKey, 'banner'], banner)
    }
    function genTalentHash(ck: string, depot: AvatarSkillDepotExcelConfigData) {
      const {
        energySkill: burst,
        skills: [_normal, skill, sprint],
        talents,
        inherentProudSkillOpens: [
          passive1,
          passive2,
          passive3,
          passive4,
          passive,
        ],
      } = depot

      // skill icon
      layeredAssignment(
        assetChar,
        [ck, 'skill'],
        avatarSkillExcelConfigData[skill].skillIcon
      )

      // burst has a more detailed _HD version
      layeredAssignment(
        assetChar,
        [ck, 'burst'],
        avatarSkillExcelConfigData[burst].skillIcon + '_HD'
      )
      if (sprint)
        layeredAssignment(
          assetChar,
          [ck, 'sprint'],
          avatarSkillExcelConfigData[sprint].skillIcon
        )

      passive1.proudSkillGroupId &&
        layeredAssignment(
          assetChar,
          [ck, 'passive1'],
          proudSkillExcelConfigData[passive1.proudSkillGroupId][0].icon
        )
      passive2.proudSkillGroupId &&
        layeredAssignment(
          assetChar,
          [ck, 'passive2'],
          proudSkillExcelConfigData[passive2.proudSkillGroupId][0].icon
        )
      if (passive3?.proudSkillGroupId)
        layeredAssignment(
          assetChar,
          [ck, 'passive3'],
          proudSkillExcelConfigData[passive3.proudSkillGroupId][0].icon
        )

      if (passive4?.proudSkillGroupId)
        layeredAssignment(
          assetChar,
          [ck, 'passive'],
          proudSkillExcelConfigData[passive4.proudSkillGroupId][0].icon
        )
      // Seems to be only used by SangonomiyaKokomi
      if (passive?.proudSkillGroupId)
        layeredAssignment(
          assetChar,
          [ck, 'passive'],
          proudSkillExcelConfigData[passive.proudSkillGroupId][0].icon
        )

      talents.forEach((skId, i) => {
        layeredAssignment(
          assetChar,
          [ck, `constellation${i + 1}`],
          avatarTalentExcelConfigData[skId].icon
        )
      })
    }

    if (candSkillDepotIds?.length) {
      // Traveler
      const [, pyro, hydro, anemo, , geo, electro, dendro] = candSkillDepotIds
      // const gender = characterIdMap[charid] === "TravelerF" ? "F" : "M"
      genTalentHash('TravelerAnemo', avatarSkillDepotExcelConfigData[anemo])
      genTalentHash('TravelerGeo', avatarSkillDepotExcelConfigData[geo])
      genTalentHash('TravelerElectro', avatarSkillDepotExcelConfigData[electro])
      genTalentHash('TravelerDendro', avatarSkillDepotExcelConfigData[dendro])
      genTalentHash('TravelerHydro', avatarSkillDepotExcelConfigData[hydro])
      genTalentHash('TravelerPyro', avatarSkillDepotExcelConfigData[pyro])
    } else {
      genTalentHash(cKey, avatarSkillDepotExcelConfigData[skillDepotId])
    }
  })

  // Dump out the asset List.
  // dumpFile(`${__dirname}/AssetData_gen.json`, assetChar)

  // Add in manually added assets that can't be datamined
  assetData.chars['Somnia'] = {} as CharacterIcon
  assetData.weapons['QuantumCatalyst'] = {} as {
    icon: string
    awakenIcon: string
  }
  dumpFile(`${proj_path}/src/AssetsData_gen.json`, assetData)

  return {
    success: true,
  }
}

export default runExecutor
