import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { layeredAssignment } from '@genshin-optimizer/common/util'
import type {
  ArtifactSetKey,
  ArtifactSlotKey,
  LocationGenderedCharacterKey,
  NonTravelerCharacterKey,
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
  getHakushinArtiData,
  getHakushinCharData,
  getHakushinWepData,
  hakushinArtis,
  hakushinChars,
  hakushinWeapons,
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
  weapons: {} as Record<WeaponKey, WepIcons>,
  artifacts: {} as Record<ArtifactSetKey, ArtiIcons>,
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

type ArtiIcons = Partial<Record<ArtifactSlotKey, string>>
type WepIcons = { icon: string; awakenIcon: string }

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
        inherentProudSkillOpens: [passive1, passive2, passive3, , passive],
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

    if (candSkillDepotIds.length) {
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

  // Hakushin asset data
  for (const key of hakushinChars) {
    assetData.chars[key] = getCharAssetsFromHakushin(key)
  }
  for (const key of hakushinArtis) {
    assetData.artifacts[key] = getArtiAssetsFromHakushin(key)
  }
  for (const key of hakushinWeapons) {
    assetData.weapons[key] = getWepAssetsFromHakushin(key)
  }

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

function getCharAssetsFromHakushin(key: NonTravelerCharacterKey) {
  const data = getHakushinCharData(key)
  const assets: CharacterIcon = {
    icon: data.Icon,
    iconSide: data.Icon.replace('AvatarIcon', 'AvatarIcon_Side'), // Janky, but best we can do
    banner: data.CharaInfo.Namecard.Icon,
    bar: data.Skills[1].Promote[0].Icon.replace(/_P$/, '_Alpha'), // Jank, but no one uses this anyways
    skill: data.Skills[1].Promote[0].Icon,
    // Alternate sprint might be [2], burst always seems to be last
    burst: data.Skills[data.Skills.length - 1].Promote[0].Icon,
    // sprint: 'Skill_S_Ayaka_02', // TODO: Add handling if needed
    passive1: data.Passives[0].Icon,
    passive2: data.Passives[1].Icon,
    // Natlan passive might be [2]
    // TODO: passive might be last, add some handling if needed
    passive: key === 'Ineffa' ? data.Passives[2].Icon : undefined,
    passive3: data.Passives[data.Passives.length - 1].Icon,
    // passive: '' // TODO: add handling if needed
    constellation1: data.Constellations[0].Icon,
    constellation2: data.Constellations[1].Icon,
    constellation3: data.Constellations[2].Icon,
    constellation4: data.Constellations[3].Icon,
    constellation5: data.Constellations[4].Icon,
    constellation6: data.Constellations[5].Icon,
  }
  return assets
}

function getArtiAssetsFromHakushin(key: ArtifactSetKey) {
  const data = getHakushinArtiData(key)
  const assets: ArtiIcons = Object.fromEntries(
    Object.entries(data.Parts).map(([dmKey, info]) => [
      artifactSlotMap[dmKey],
      info.Icon,
    ])
  )
  return assets
}

function getWepAssetsFromHakushin(key: WeaponKey) {
  const data = getHakushinWepData(key)
  const assets: WepIcons = {
    icon: data.Icon,
    awakenIcon: `${data.Icon}_Awaken`, // Janky, but best we can do
  }
  return assets
}
