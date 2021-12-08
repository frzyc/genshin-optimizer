import { artifactIdMap, artifactSlotMap, characterIdMap, weaponIdMap, weaponMap } from '.'
import { AssetData } from './Data'
import artifactPiecesData from './DataminedModules/artifact/ReliquaryExcelConfigData'
import reliquarySetExcelConfigData from './DataminedModules/artifact/ReliquarySetExcelConfigData'
import avatarExcelConfigData from './DataminedModules/character/AvatarExcelConfigData'
import constellations from './DataminedModules/character/constellations'
import fetterCharacterCardExcelConfigData from './DataminedModules/character/FetterCharacterCardExcelConfigData'
import materialExcelConfigData from './DataminedModules/character/MaterialExcelConfigData'
import skillGroups from './DataminedModules/character/passives'
import rewardExcelConfigData from './DataminedModules/character/RewardExcelConfigData'
import skillDepot, { AvatarSkillDepotExcelConfigData } from './DataminedModules/character/skillDepot'
import talents from './DataminedModules/character/talents'
import weaponExcelConfigData from './DataminedModules/weapon/WeaponExcelConfigData'
import { crawlObject, dumpFile, layeredAssignment } from './Util'
const fs = require('fs')

export default function loadImages() {
  const hasTexture2D = fs.existsSync('./Texture2D')
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
  Object.entries(reliquarySetExcelConfigData).filter(([SetId, data]) => SetId in artifactIdMap).forEach(([SetId, data]) => {
    const { EquipAffixId, ContainsList } = data
    if (!EquipAffixId) return

    const pieces = Object.fromEntries(ContainsList.map(pieceId => {
      const pieceData = artifactPiecesData[pieceId]
      if (!pieceData) throw `No piece data with Id ${pieceId} in SetId ${SetId}`
      const { Icon, EquipType } = pieceData
      return [artifactSlotMap[EquipType], Icon]
    }))

    AssetData.artifact[artifactIdMap[SetId]] = pieces
  })
  Object.entries(AssetData.artifact).forEach(([setKey, pieces]) =>
    Object.entries(pieces).forEach(([slotKey, icon]) =>
      copyFile(`${__dirname}/Texture2D/${icon}.png`, `${__dirname}/../src/Data/Artifacts/${setKey}/${slotKey}.png`)))


  // Get the icon/awakened for each weapon
  Object.entries(weaponExcelConfigData).filter(([weaponid, weaponData]) => weaponid in weaponIdMap).forEach(([weaponid, weaponData]) => {
    const { Icon, AwakenIcon, WeaponType } = weaponData
    const weaponType = weaponMap[WeaponType]
    AssetData.weapon[weaponType][weaponIdMap[weaponid]] = {
      Icon,
      AwakenIcon
    }
  })
  Object.entries(AssetData.weapon).forEach(([weaponTypeKey, weaponTypeData]) => {
    Object.entries(weaponTypeData).forEach(([weaponKey, { Icon, AwakenIcon }]) => {
      copyFile(`${__dirname}/Texture2D/${Icon}.png`, `${__dirname}/../src/Data/Weapons/${weaponTypeKey[0].toUpperCase() + weaponTypeKey.slice(1)}/${weaponKey}/Icon.png`)
      copyFile(`${__dirname}/Texture2D/${AwakenIcon}.png`, `${__dirname}/../src/Data/Weapons/${weaponTypeKey[0].toUpperCase() + weaponTypeKey.slice(1)}/${weaponKey}/AwakenIcon.png`)
    })
  })

  // parse baseStat/ascension/basic data for non traveler.
  Object.entries(avatarExcelConfigData).filter(([charid, charData]) => charid in characterIdMap).map(([charid, charData]) => {
    const { IconName, SideIconName } = charData

    let Banner, Bar;
    if (fetterCharacterCardExcelConfigData[charid]) {
      const { RewardId } = fetterCharacterCardExcelConfigData[charid]
      const { RewardItemList } = rewardExcelConfigData[RewardId]
      const { ItemId } = RewardItemList[0];
      ({ UseParam: [Bar, Banner] } = materialExcelConfigData[ItemId]);
    }
    AssetData.char[characterIdMap[charid]] = {
      Icon: IconName,
      IconSide: SideIconName,
      Banner,
      Bar
    }
  })

  const characterAssetDump = {}
  Object.entries(avatarExcelConfigData).filter(([charid,]) => charid in characterIdMap).forEach(([charid, charData]) => {
    const { IconName, SideIconName, SkillDepotId, CandSkillDepotIds } = charData
    let skillDepotId = SkillDepotId

    const keys = [characterIdMap[charid]]
    layeredAssignment(characterAssetDump, [...keys, "Icon"], IconName)
    layeredAssignment(characterAssetDump, [...keys, "IconSide"], SideIconName)

    if (fetterCharacterCardExcelConfigData[charid]) {
      const { RewardId } = fetterCharacterCardExcelConfigData[charid]
      const { RewardItemList } = rewardExcelConfigData[RewardId]
      const { ItemId } = RewardItemList[0];
      const { UseParam: [Bar, Banner] } = materialExcelConfigData[ItemId];
      Bar && layeredAssignment(characterAssetDump, [...keys, "Bar"], Bar)
      Banner && layeredAssignment(characterAssetDump, [...keys, "Banner"], Banner)
    }
    function genTalentHash(keys: string[], depot: AvatarSkillDepotExcelConfigData) {
      const { EnergySkill: burst, Skills: [normal, skill, sprint], Talents, InherentProudSkillOpens: [passive1, passive2, passive3, , passive] } = depot

      // auto icons are shared.
      // layeredAssignment(characterAssetDump, [...keys, "auto"], talents[normal].SkillIcon)
      layeredAssignment(characterAssetDump, [...keys, "skill"], talents[skill].SkillIcon)

      // Burst has a more detailed _HD version
      layeredAssignment(characterAssetDump, [...keys, "burst"], talents[burst].SkillIcon + "_HD")
      if (sprint)
        layeredAssignment(characterAssetDump, [...keys, "sprint"], talents[sprint].SkillIcon)

      layeredAssignment(characterAssetDump, [...keys, "passive1"], skillGroups[passive1.ProudSkillGroupId][0].Icon)
      layeredAssignment(characterAssetDump, [...keys, "passive2"], skillGroups[passive2.ProudSkillGroupId][0].Icon)
      if (passive3?.ProudSkillGroupId)
        layeredAssignment(characterAssetDump, [...keys, "passive3"], skillGroups[passive3.ProudSkillGroupId][0].Icon)

      // Seems to be only used by SangonomiyaKokomi
      if (passive?.ProudSkillGroupId)
        layeredAssignment(characterAssetDump, [...keys, "passive"], skillGroups[passive.ProudSkillGroupId][0].Icon)

      Talents.forEach((skId, i) => {
        layeredAssignment(characterAssetDump, [...keys, `constellation${i + 1}`], constellations[skId].Icon)
      })
    }

    if (CandSkillDepotIds.length) { // Traveler
      // This will be 504,506... for male
      genTalentHash([...keys, "anemo"], skillDepot[704])
      genTalentHash([...keys, "geo"], skillDepot[706])
      genTalentHash([...keys, "electro"], skillDepot[707])
    } else {
      genTalentHash(keys, skillDepot[skillDepotId])
    }
  })
  // Dump out the asset List.
  dumpFile(`${__dirname}/AssetData_gen.json`, characterAssetDump)
  crawlObject(characterAssetDump, [], s => typeof s === "string", (icon, keys) => {
    copyFile(`${__dirname}/Texture2D/${icon}.png`, `${__dirname}/../src/Data/Characters/${keys.join("/")}.png`)
  })
}
