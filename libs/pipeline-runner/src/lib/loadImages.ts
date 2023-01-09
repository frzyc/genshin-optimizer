import { artifactPiecesData, avatarExcelConfigData, AvatarSkillDepotExcelConfigData, constellations, DM2D_PATH, fetterCharacterCardExcelConfigData, materialExcelConfigData, reliquarySetExcelConfigData, rewardExcelConfigData, skillDepot, skillGroups, talentsData, weaponExcelConfigData } from '@genshin-optimizer/dm'
import { artifactIdMap, artifactSlotMap, characterIdMap, dumpFile, weaponIdMap, weaponMap } from '@genshin-optimizer/pipeline'
import { crawlObject, layeredAssignment } from '@genshin-optimizer/util'
import { FRONTEND_PATH } from './Util'
import fs = require('fs')

type WeaponIcon = { icon: string, awakenIcon: string }
type WeaponIconData = { [key: string]: WeaponIcon }

type CharacterIcon = {
  icon: string,
  iconSide: string,
  banner: string,
  bar: string
}
type CharacterIconData = { [key: string]: CharacterIcon }
//An object to store all the asset related data.
export const AssetData = {
  weapon: {
    sword: {} as WeaponIconData,
    bow: {} as WeaponIconData,
    catalyst: {} as WeaponIconData,
    claymore: {} as WeaponIconData,
    polearm: {} as WeaponIconData,
  },
  artifact: {},
  char: {} as CharacterIconData,
}

export default function loadImages() {
  const hasTexture2D = fs.existsSync(DM2D_PATH)
  function copyFile(src, dest) {
    if (!fs.existsSync(src)) {
      if (hasTexture2D) console.warn("Cannot find file", src)
      return
    }
    fs.copyFile(src, dest, (err) => {
      if (err) throw err;
    });
  }

  // Get icons for each artifact piece
  Object.entries(reliquarySetExcelConfigData).forEach(([setId, data]) => {
    const { EquipAffixId, containsList } = data
    if (!EquipAffixId) return

    const pieces = Object.fromEntries(containsList.map(pieceId => {
      const pieceData = artifactPiecesData[pieceId]
      if (!pieceData) throw `No piece data with id ${pieceId} in setId ${setId}`
      const { icon, equipType } = pieceData
      return [artifactSlotMap[equipType], icon]
    }))

    AssetData.artifact[artifactIdMap[setId]] = pieces
  })
  Object.entries(AssetData.artifact).forEach(([setKey, pieces]) =>
    Object.entries(pieces as any).forEach(([slotKey, icon]) =>
      copyFile(`${DM2D_PATH}/${icon}.png`, `${FRONTEND_PATH}/app/Data/Artifacts/${setKey}/${slotKey}.png`)))


  // Get the icon/awakened for each weapon
  Object.entries(weaponExcelConfigData).forEach(([weaponid, weaponData]) => {
    const { icon, awakenIcon, weaponType } = weaponData
    const wepType = weaponMap[weaponType]
    AssetData.weapon[wepType][weaponIdMap[weaponid]] = {
      icon,
      awakenIcon
    }
  })
  Object.entries(AssetData.weapon).forEach(([weaponTypeKey, weaponTypeData]) => {
    Object.entries(weaponTypeData).forEach(([weaponKey, { icon, awakenIcon }]) => {
      copyFile(`${DM2D_PATH}/${icon}.png`, `${FRONTEND_PATH}/app/Data/Weapons/${weaponTypeKey[0].toUpperCase() + weaponTypeKey.slice(1)}/${weaponKey}/Icon.png`)
      copyFile(`${DM2D_PATH}/${awakenIcon}.png`, `${FRONTEND_PATH}/app/Data/Weapons/${weaponTypeKey[0].toUpperCase() + weaponTypeKey.slice(1)}/${weaponKey}/AwakenIcon.png`)
    })
  })

  // parse baseStat/ascension/basic data for non traveler.
  Object.entries(avatarExcelConfigData).forEach(([charid, charData]) => {
    const { iconName, sideIconName } = charData

    let banner, bar;
    if (fetterCharacterCardExcelConfigData[charid]) {
      const { rewardId } = fetterCharacterCardExcelConfigData[charid]
      const { rewardItemList } = rewardExcelConfigData[rewardId]
      const { itemId } = rewardItemList[0];
      ({ picPath: [bar, banner] } = materialExcelConfigData[itemId]);
    }
    AssetData.char[characterIdMap[charid]] = {
      icon: iconName,
      iconSide: sideIconName,
      banner,
      bar
    }
  })

  const characterAssetDump = {}
  Object.entries(avatarExcelConfigData).forEach(([charid, charData]) => {
    const { iconName, sideIconName, skillDepotId, candSkillDepotIds } = charData

    const keys = [characterIdMap[charid]]
    layeredAssignment(characterAssetDump, [...keys, "icon"], iconName)
    layeredAssignment(characterAssetDump, [...keys, "iconSide"], sideIconName)

    if (fetterCharacterCardExcelConfigData[charid]) {
      const { rewardId } = fetterCharacterCardExcelConfigData[charid]
      const { rewardItemList } = rewardExcelConfigData[rewardId]
      const { itemId } = rewardItemList[0];
      const { picPath: [bar, banner] } = materialExcelConfigData[itemId];
      bar && layeredAssignment(characterAssetDump, [...keys, "bar"], bar)
      banner && layeredAssignment(characterAssetDump, [...keys, "banner"], banner)
    }
    function genTalentHash(keys: string[], depot: AvatarSkillDepotExcelConfigData) {
      const { energySkill: burst, skills: [normal, skill, sprint], talents, inherentProudSkillOpens: [passive1, passive2, passive3, , passive] } = depot

      // auto icons are shared.
      // layeredAssignment(characterAssetDump, [...keys, "auto"], talents[normal].skillIcon)
      layeredAssignment(characterAssetDump, [...keys, "skill"], talentsData[skill].skillIcon)

      // burst has a more detailed _HD version
      layeredAssignment(characterAssetDump, [...keys, "burst"], talentsData[burst].skillIcon + "_HD")
      if (sprint)
        layeredAssignment(characterAssetDump, [...keys, "sprint"], talentsData[sprint].skillIcon)

      passive1.proudSkillGroupId && layeredAssignment(characterAssetDump, [...keys, "passive1"], skillGroups[passive1.proudSkillGroupId][0].icon)
      passive2.proudSkillGroupId && layeredAssignment(characterAssetDump, [...keys, "passive2"], skillGroups[passive2.proudSkillGroupId][0].icon)
      if (passive3?.proudSkillGroupId)
        layeredAssignment(characterAssetDump, [...keys, "passive3"], skillGroups[passive3.proudSkillGroupId][0].icon)

      // Seems to be only used by SangonomiyaKokomi
      if (passive?.proudSkillGroupId)
        layeredAssignment(characterAssetDump, [...keys, "passive"], skillGroups[passive.proudSkillGroupId][0].icon)

      talents.forEach((skId, i) => {
        layeredAssignment(characterAssetDump, [...keys, `constellation${i + 1}`], constellations[skId].icon)
      })
    }

    if (candSkillDepotIds.length) { // Traveler
      const [_1, _2, _3, anemo, _5, geo, electro, dendro] = candSkillDepotIds
      const gender = characterIdMap[charid] === "TravelerF" ? "F" : "M"
      genTalentHash(["TravelerAnemo" + gender], skillDepot[anemo])
      genTalentHash(["TravelerGeo" + gender], skillDepot[geo])
      genTalentHash(["TravelerElectro" + gender], skillDepot[electro])
      genTalentHash(["TravelerDendro" + gender], skillDepot[dendro])
    } else {
      genTalentHash(keys, skillDepot[skillDepotId])
    }
  })
  // Dump out the asset List.
  dumpFile(`${__dirname}/AssetData_gen.json`, characterAssetDump)
  crawlObject(characterAssetDump, [], s => typeof s === "string", (icon, keys) => {
    copyFile(`${DM2D_PATH}/${icon}.png`, `${FRONTEND_PATH}/app/Data/Characters/${keys.join("/")}.png`)
  })
}
