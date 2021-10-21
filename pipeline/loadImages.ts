import { artifactIdMap, artifactSlotMap, characterIdMap, weaponIdMap, weaponMap } from '.'
import { AssetData } from './Data'
import artifactPiecesData from './DataminedModules/artifact/artifactPiecesData'
import artifactSetData from './DataminedModules/artifact/artifactSets'
import characterData from './DataminedModules/character/character'
import fetterCharacterCardExcelConfigData from './DataminedModules/character/FetterCharacterCardExcelConfigData'
import materialExcelConfigData from './DataminedModules/character/MaterialExcelConfigData'
import rewardExcelConfigData from './DataminedModules/character/RewardExcelConfigData'
import weaponData from './DataminedModules/weapon/weapon'
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
  Object.entries(artifactSetData).filter(([SetId, data]) => SetId in artifactIdMap).forEach(([SetId, data]) => {
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
      copyFile(`./Texture2D/${icon}.png`, `../src/Data/Artifacts/${setKey}/${slotKey}.png`)))


  // Get the icon/awakened for each weapon
  Object.entries(weaponData).filter(([weaponid, weaponData]) => weaponid in weaponIdMap).forEach(([weaponid, weaponData]) => {
    const { Icon, AwakenIcon, WeaponType } = weaponData
    const weaponType = weaponMap[WeaponType]
    AssetData.weapon[weaponType][weaponIdMap[weaponid]] = {
      Icon,
      AwakenIcon
    }
  })
  Object.entries(AssetData.weapon).forEach(([weaponTypeKey, weaponTypeData]) => {
    Object.entries(weaponTypeData).forEach(([weaponKey, { Icon, AwakenIcon }]) => {
      copyFile(`./Texture2D/${Icon}.png`, `../src/Data/Weapons/${weaponTypeKey[0].toUpperCase() + weaponTypeKey.slice(1)}/${weaponKey}/Icon.png`)
      copyFile(`./Texture2D/${AwakenIcon}.png`, `../src/Data/Weapons/${weaponTypeKey[0].toUpperCase() + weaponTypeKey.slice(1)}/${weaponKey}/AwakenIcon.png`)
    })
  })


  // parse baseStat/ascension/basic data for non travelr.
  Object.entries(characterData).filter(([charid, charData]) => charid in characterIdMap).map(([charid, charData]) => {
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
  Object.entries(AssetData.char).forEach(([characterKey, { Icon, IconSide, Banner, Bar }]) => {
    copyFile(`./Texture2D/${Icon}.png`, `../src/Data/Characters/${characterKey}/Icon.png`)
    copyFile(`./Texture2D/${IconSide}.png`, `../src/Data/Characters/${characterKey}/IconSide.png`)
    if (Banner)
      copyFile(`./Texture2D/${Banner}.png`, `../src/Data/Characters/${characterKey}/Banner.png`)
    if (Bar)
      copyFile(`./Texture2D/${Bar}.png`, `../src/Data/Characters/${characterKey}/Bar.png`)
  })

  // dump out the data for testing
  // dumpFile('./AssetData.json', AssetData)
}
