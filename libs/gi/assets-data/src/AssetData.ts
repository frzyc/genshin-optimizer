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
//An object to store all the asset related data.
export const AssetData = {
  weapons: {} as Record<WeaponKey, { icon: string; awakenIcon: string }>,
  artifacts: {} as Record<
    ArtifactSetKey,
    Partial<Record<ArtifactSlotKey, string>>
  >,
  chars: {} as CharacterIconData,
  normalIcons: {
    sword: 'Skill_A_01',
    bow: 'Skill_A_02',
    polearm: 'Skill_A_03',
    claymore: 'Skill_A_04',
    catalyst: 'Skill_A_Catalyst_MD',
  },
  elemIcons: {
    anemo: 'UI_Buff_Element_Wind',
    geo: 'UI_Buff_Element_Rock',
    electro: 'UI_Buff_Element_Electric',
    hydro: 'UI_Buff_Element_Water',
    pyro: 'UI_Buff_Element_Fire',
    cryo: 'UI_Buff_Element_Ice',
    dendro: 'UI_Buff_Element_Grass',
  },
}

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

  AssetData.artifacts[artifactIdMap[setId]] = pieces
})

// Get the icon/awakened for each weapon
Object.entries(weaponExcelConfigData).forEach(([weaponid, weaponData]) => {
  const { icon, awakenIcon } = weaponData
  AssetData.weapons[weaponIdMap[weaponid as WeaponId]] = {
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
  AssetData.chars[characterIdMap[charid]] = assets
})

const assetChar = AssetData.chars
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
    const [, , hydro, anemo, , geo, electro, dendro] = candSkillDepotIds
    // const gender = characterIdMap[charid] === "TravelerF" ? "F" : "M"
    genTalentHash('TravelerAnemo', avatarSkillDepotExcelConfigData[anemo])
    genTalentHash('TravelerGeo', avatarSkillDepotExcelConfigData[geo])
    genTalentHash('TravelerElectro', avatarSkillDepotExcelConfigData[electro])
    genTalentHash('TravelerDendro', avatarSkillDepotExcelConfigData[dendro])
    genTalentHash('TravelerHydro', avatarSkillDepotExcelConfigData[hydro])
  } else {
    genTalentHash(cKey, avatarSkillDepotExcelConfigData[skillDepotId])
  }
})

// Dump out the asset List.
// dumpFile(`${__dirname}/AssetData_gen.json`, assetChar)

// Add in manually added assets that can't be datamined
AssetData.chars['Somnia'] = {} as CharacterIcon
AssetData.weapons['QuantumCatalyst'] = {} as {
  icon: string
  awakenIcon: string
}
// await generateIndexFromObj(AssetData, `${DEST_PROJ_PATH}/gen`)
